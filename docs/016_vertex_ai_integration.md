# 016: Vertex AI Gemini 統合

## 概要
Vertex AI の Gemini API を統合し、AI チャット機能の基盤を構築する。価格履歴データをコンテキストに注入して回答精度を向上させる。

## 技術スタック
- **AI Platform**: Vertex AI
- **Model**: Gemini 2.5 Flash
- **SDK**: @google/genai
- **Authentication**: Application Default Credentials

## TODO
- [ ] Google Cloud プロジェクト作成
- [ ] Vertex AI API 有効化
- [ ] サービスアカウント作成
- [ ] @google/genai パッケージインストール
- [ ] 環境変数設定
- [ ] Vertex AI クライアント作成
- [ ] チャット API 実装
- [ ] エラーハンドリング

## 実装詳細

### 1. Google Cloud セットアップ
1. Google Cloud Console でプロジェクト作成
2. Vertex AI API を有効化
3. サービスアカウント作成（Vertex AI User 権限）
4. JSON キーファイルをダウンロード

### 2. パッケージインストール
```bash
npm install @google/genai
```

### 3. 環境変数設定
`.env.local`:
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_GENAI_USE_VERTEXAI=True
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Vercel 用（本番環境）:
```bash
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

### 4. Vertex AI クライアント
`src/lib/vertexai/client.ts`:
```typescript
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export function createVertexAIClient() {
  // Vercel 環境での認証設定
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const tempPath = '/tmp/credentials.json';
    fs.writeFileSync(
      tempPath,
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
    process.env.GOOGLE_APPLICATION_CREDENTIALS = tempPath;
  }

  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    throw new Error('GOOGLE_CLOUD_PROJECT is not set');
  }

  return new GoogleGenAI({
    vertexai: true,
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  });
}
```

### 5. プロンプト生成関数
`src/lib/vertexai/prompts.ts`:
```typescript
import { PriceHistory, Asset } from '@/types';

export function generateChatPrompt(
  userMessage: string,
  assets: Asset[],
  priceHistories: Record<string, PriceHistory[]>
): string {
  // 価格履歴をコンテキストに追加
  const contextData = assets.map((asset) => {
    const history = priceHistories[asset.id] || [];
    const latest = history[0];
    const oldest = history[history.length - 1];

    return {
      symbol: asset.symbol,
      name: asset.name,
      type: asset.type,
      latest_price: latest?.price_usd,
      price_change: latest && oldest
        ? ((latest.price_usd - oldest.price_usd) / oldest.price_usd) * 100
        : null,
      data_points: history.length,
    };
  });

  return `
You are an AI assistant for Bitcoin Navi, a cryptocurrency and stock monitoring application.

Current portfolio data:
${JSON.stringify(contextData, null, 2)}

User question: ${userMessage}

Please provide a helpful, accurate response based on the available data. If you need more recent information, mention that you can use web search to get the latest data.
  `.trim();
}
```

### 6. チャット API
`src/app/api/chat/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createVertexAIClient } from '@/lib/vertexai/client';
import { generateChatPrompt } from '@/lib/vertexai/prompts';
import { getDatabase } from '@/lib/db/get-db';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get portfolio data for context
    const db = getDatabase();
    const assets = await db.getAssets();

    // Get recent price history for each asset
    const priceHistories: Record<string, any[]> = {};
    await Promise.all(
      assets.map(async (asset) => {
        const history = await db.getPriceHistory(asset.id, 100);
        priceHistories[asset.id] = history;
      })
    );

    // Generate prompt with context
    const prompt = generateChatPrompt(message, assets, priceHistories);

    // Call Vertex AI
    const client = createVertexAIClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    return NextResponse.json({
      reply: response.text,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const maxDuration = 30;
```

### 7. リトライロジック
`src/lib/vertexai/generate-with-retry.ts`:
```typescript
import { createVertexAIClient } from './client';

export async function generateWithRetry(
  prompt: string,
  maxRetries = 3
): Promise<string> {
  const client = createVertexAIClient();
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      return response.text;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);

      // Exponential backoff
      if (i < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

### 8. ストリーミングレスポンス（次のチケットで実装）
`src/app/api/chat/stream/route.ts`:
```typescript
import { NextRequest } from 'next/server';
import { createVertexAIClient } from '@/lib/vertexai/client';
import { generateChatPrompt } from '@/lib/vertexai/prompts';
import { getDatabase } from '@/lib/db/get-db';

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const db = getDatabase();
  const assets = await db.getAssets();
  const priceHistories: Record<string, any[]> = {};

  await Promise.all(
    assets.map(async (asset) => {
      const history = await db.getPriceHistory(asset.id, 100);
      priceHistories[asset.id] = history;
    })
  );

  const prompt = generateChatPrompt(message, assets, priceHistories);
  const client = createVertexAIClient();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const responseStream = await client.models.generateContentStream({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        for await (const chunk of responseStream.stream) {
          const text = chunk.text();
          controller.enqueue(new TextEncoder().encode(text));
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  });
}

export const runtime = 'nodejs';
export const maxDuration = 30;
```

### 9. エラーハンドリング
```typescript
export class VertexAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'VertexAIError';
  }
}

export function handleVertexAIError(error: any): VertexAIError {
  if (error.code === 'ENOTFOUND') {
    return new VertexAIError(
      'Network error: Unable to reach Vertex AI',
      'NETWORK_ERROR',
      503
    );
  }

  if (error.message?.includes('quota')) {
    return new VertexAIError(
      'API quota exceeded',
      'QUOTA_EXCEEDED',
      429
    );
  }

  return new VertexAIError(
    error.message || 'Unknown error occurred',
    'UNKNOWN_ERROR',
    500
  );
}
```

### 10. 型定義
`src/types/chat.ts`:
```typescript
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface Citation {
  title: string;
  url: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  reply: string;
  timestamp: string;
  citations?: Citation[];
}
```

## 完了条件
- [ ] Vertex AI が正しく設定されている
- [ ] チャット API が動作する
- [ ] 価格履歴がコンテキストに注入される
- [ ] エラーハンドリングが実装されている
- [ ] リトライロジックが動作する
- [ ] 型定義が正しい

## 関連チケット
- 前: #015 過去データ初期ロード機能
- 次: #017 Grounding 実装
- 関連: #008 AI チャット画面 UI
