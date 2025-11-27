# 019: Web Grounding トラブルシューティング

## 問題の概要
Vertex AI Gemini 2.5 Pro で Web Grounding（Google Search）を使用したところ、**古い日付（2024年5月24日）の情報**が返ってくる問題が発生した。

## 原因分析

### 1. SDK vs REST API の違い
**問題のあった実装** (`@google/genai` SDK):
```typescript
const client = createVertexAIClient();
const response = await client.models.generateContentStream({
  model: 'gemini-2.5-pro',
  contents: prompt,
  tools: [{ googleSearch: {} }],
  generationConfig: {
    temperature: 0.2,  // ❌ 低すぎる
    topP: 0.8,
    maxOutputTokens: 30000,
  },
});
```

**問題点:**
- Temperature が 0.2 と低すぎる（Google 推奨値: **1.0**）
- SDK の内部実装が不明確
- Grounding Metadata が取得できない

### 2. 正しい実装（REST API 直接呼び出し）
**参考コード**: `grounding_ref.gs`（Google Apps Script で動作確認済み）

**エンドポイント**:
```
https://us-central1-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/us-central1/publishers/google/models/gemini-2.5-pro:generateContent
```

**リクエストボディ**:
```json
{
  "contents": [
    {
      "role": "model",
      "parts": [{ "text": "システム指示" }]
    },
    {
      "role": "user",
      "parts": [{ "text": "ユーザーの質問" }]
    }
  ],
  "generationConfig": {
    "temperature": 1.0,  // ✅ Google 推奨値
    "topP": 0.7,
    "maxOutputTokens": 8192
  },
  "tools": [
    {
      "googleSearch": {}  // ✅ Google Search を有効化
    }
  ]
}
```

## 解決策

### 実装ファイル
1. **REST API クライアント**: `src/lib/vertexai/rest-client.ts`
2. **Chat API**: `src/app/api/chat/route.ts`
3. **フロントエンド**: `src/app/(dashboard)/chat/page.tsx`

### 1. REST API クライアントの作成
`src/lib/vertexai/rest-client.ts`:
```typescript
import { GoogleAuth } from 'google-auth-library';

async function getAccessToken(): Promise<string> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token!;
}

export async function generateContentWithGrounding(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  options: {
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    model?: string;
  } = {}
) {
  const {
    temperature = 1.0,  // ✅ Google 推奨値
    topP = 0.7,
    maxOutputTokens = 8192,
    model = 'gemini-2.5-pro',
  } = options;

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;

  // Convert messages to Gemini format
  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  const requestBody = {
    contents,
    generationConfig: { temperature, topP, maxOutputTokens },
    tools: [{ googleSearch: {} }],  // ✅ Google Search 有効化
  };

  const token = await getAccessToken();

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const json = await response.json();

  // Extract answer and grounding metadata
  const candidate = json.candidates[0];
  let answer = candidate.content.parts
    .filter((part) => part.text)
    .map((part) => part.text)
    .join('\n');

  // Remove reference numbers like [1], [2]
  answer = answer.replace(/\[\d+\]\s*/g, '');

  // Extract grounding information
  const groundingInfo = [];
  const searchQueries = [];

  if (candidate.groundingMetadata) {
    const metadata = candidate.groundingMetadata;

    // Extract search queries
    if (metadata.webSearchQueries) {
      searchQueries.push(...metadata.webSearchQueries);
    }

    // Extract grounding chunks (sources)
    if (metadata.groundingChunks) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri) {
          groundingInfo.push({
            uri: chunk.web.uri,
            title: chunk.web.title || 'No Title',
          });
        }
      }
    }
  }

  return { answer, groundingInfo, searchQueries };
}
```

### 2. Chat API の更新
`src/app/api/chat/route.ts`:
```typescript
import { generateContentWithGrounding } from '@/lib/vertexai/rest-client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { message, priceHistory } = await request.json();

  // Build messages array
  const messages = [];

  // System instruction
  messages.push({
    role: 'assistant',
    content: 'あなたは、敬語ではなく平易語で、フレンドリーに絵文字を用いながら会話してください。',
  });

  // User message with context
  let userMessage = `【重要な指示】
- 必ずGoogle検索を使って、リアルタイムの最新情報を取得してください
- 架空の情報や予測ではなく、実際のニュースや事実に基づいて回答してください

ユーザーの質問: ${message}`;

  messages.push({ role: 'user', content: userMessage });

  // Call REST API
  const response = await generateContentWithGrounding(messages, {
    temperature: 1.0,  // ✅ Google 推奨値
    topP: 0.7,
    maxOutputTokens: 8192,
  });

  return NextResponse.json({
    answer: response.answer,
    groundingInfo: response.groundingInfo,
    searchQueries: response.searchQueries,
  });
}
```

### 3. フロントエンドの更新
`src/app/(dashboard)/chat/page.tsx`:
```typescript
// Parse JSON response (ストリーミングではなく通常のレスポンス)
const data = await response.json();

let assistantContent = data.answer;

// Add grounding sources
if (data.groundingInfo && data.groundingInfo.length > 0) {
  assistantContent += '\n\n📚 **参考情報:**\n';
  data.groundingInfo.forEach((info, index) => {
    assistantContent += `${index + 1}. [${info.title}](${info.uri})\n`;
  });
}

// Log search queries for debugging
if (data.searchQueries && data.searchQueries.length > 0) {
  console.log('Search queries used:', data.searchQueries);
}
```

## 重要なポイント

### 1. Temperature 設定
- **推奨値**: `1.0`（Google 公式ドキュメント）
- **理由**: 低い値だとモデルが保守的になり、検索を実行しない可能性がある

### 2. Grounding Metadata の確認
レスポンスに以下が含まれる：
```json
{
  "groundingMetadata": {
    "webSearchQueries": ["検索クエリ1", "検索クエリ2"],
    "groundingChunks": [
      {
        "web": {
          "uri": "https://example.com",
          "title": "記事タイトル"
        }
      }
    ]
  }
}
```

### 3. 認証方式
- **ローカル開発**: `gcloud auth application-default login`
- **本番環境**: サービスアカウントキー（JSON）を環境変数に設定

## 動作確認

### ログ出力例（成功時）
```
Calling Vertex AI with REST API...
Vertex AI Request: {
  endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects/...',
  model: 'gemini-2.5-pro',
  messageCount: 2,
  temperature: 1,
  topP: 0.7
}
Vertex AI Response received: {
  hasCandidates: true,
  candidateCount: 1,
  hasGroundingMetadata: true
}
Grounding Metadata: {
  hasWebSearchQueries: true,
  queryCount: 3,
  hasGroundingChunks: false,
  chunkCount: 0
}
```

**重要**: `queryCount` が 0 より大きければ、検索が実行されている証拠 ✅

## 参考資料
- **Google 公式ドキュメント**: [Grounding with Google Search](https://cloud.google.com/vertex-ai/generative-ai/docs/grounding/grounding-with-google-search)
- **温度設定**: Temperature 1.0 が推奨（公式ドキュメント記載）
- **参考実装**: `bitcoin_navi/grounding_ref.gs`（Google Apps Script）

## 関連チケット
- #017: Grounding with Google Search 実装
- #018: チャット機能完成

## 完了日
2025-11-27
