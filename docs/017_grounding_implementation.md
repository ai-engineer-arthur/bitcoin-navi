# 017: Grounding with Google Search 実装

## 概要
Gemini の Grounding 機能を使用して、リアルタイムの Web 検索結果を活用した回答を生成する。引用元（Citations）も表示する。

## 技術スタック
- **AI Platform**: Vertex AI
- **Model**: Gemini 2.5 Flash
- **Feature**: Grounding with Google Search

## TODO
- [ ] Grounding ツール設定
- [ ] 検索クエリ最適化
- [ ] Citations 抽出機能
- [ ] UI に引用元表示
- [ ] キャッシュ戦略
- [ ] エラーハンドリング

## 実装詳細

### 1. Grounding 対応チャット API
`src/app/api/chat/grounded/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createVertexAIClient } from '@/lib/vertexai/client';
import { generateChatPrompt } from '@/lib/vertexai/prompts';
import { getDatabase } from '@/lib/db/get-db';
import type { Tool, GoogleSearch } from '@google/genai';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // Get portfolio data
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

    // Configure Google Search tool
    const googleSearchTool: Tool = {
      googleSearch: {} as GoogleSearch,
    };

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [googleSearchTool],
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    // Extract grounding metadata
    const groundingMetadata = response.groundingMetadata;

    return NextResponse.json({
      reply: response.text,
      timestamp: new Date().toISOString(),
      grounding: {
        searchQueries: groundingMetadata?.webSearchQueries || [],
        citations: extractCitations(groundingMetadata),
      },
    });
  } catch (error) {
    console.error('Grounded chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

function extractCitations(metadata: any) {
  if (!metadata?.groundingChunks) return [];

  return metadata.groundingChunks.map((chunk: any) => ({
    title: chunk.web?.title || 'Untitled',
    url: chunk.web?.uri || '#',
    snippet: chunk.web?.snippet || '',
  }));
}

export const runtime = 'nodejs';
export const maxDuration = 30;
```

### 2. 検索最適化プロンプト
`src/lib/vertexai/prompts.ts` に追加:
```typescript
export function generateGroundedPrompt(
  userMessage: string,
  assets: Asset[],
  priceHistories: Record<string, PriceHistory[]>
): string {
  const contextData = assets.map((asset) => {
    const history = priceHistories[asset.id] || [];
    const latest = history[0];

    return {
      symbol: asset.symbol,
      name: asset.name,
      latest_price: latest?.price_usd,
    };
  });

  return `
You are an AI assistant for Bitcoin Navi with access to real-time web search.

Current portfolio data:
${JSON.stringify(contextData, null, 2)}

User question: ${userMessage}

Instructions:
1. If the question requires recent market data, use web search to find the latest information
2. Combine your knowledge with web search results to provide accurate answers
3. Always cite your sources when using web search results
4. Focus on reputable financial news sources

User question: ${userMessage}
  `.trim();
}
```

### 3. Citations 表示コンポーネント
`src/components/features/message-citations.tsx`:
```typescript
import { ExternalLink } from 'lucide-react';

interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

interface MessageCitationsProps {
  citations: Citation[];
}

export function MessageCitations({ citations }: MessageCitationsProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">
        Sources:
      </p>
      <div className="space-y-2">
        {citations.map((citation, index) => (
          <a
            key={index}
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-2">
              <ExternalLink size={14} className="text-primary mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {citation.title}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {new URL(citation.url).hostname}
                </p>
                {citation.snippet && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {citation.snippet}
                  </p>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
```

### 4. メッセージバブル更新
`src/components/features/message-bubble.tsx` を更新:
```typescript
import { MessageCitations } from './message-citations';

export function MessageBubble({
  role,
  content,
  timestamp,
  citations,
}: MessageBubbleProps) {
  // ... existing code ...

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 ...">...</div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ...`}>
        <div className="rounded-lg p-4 ...">
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {/* Citations */}
        {!isUser && <MessageCitations citations={citations || []} />}

        <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
      </div>
    </div>
  );
}
```

### 5. チャット機能更新
`src/components/features/chat-messages.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';

export function ChatMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    try {
      // Call grounded API
      const response = await fetch('/api/chat/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(),
        citations: data.grounding?.citations || [],
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))}
      </div>
      <ChatInput onSend={handleSendMessage} disabled={loading} />
    </>
  );
}
```

### 6. キャッシュ戦略
```typescript
// Grounding 結果をキャッシュ（同じ質問への高速応答）
const groundingCache = new Map<string, {
  response: string;
  citations: any[];
  timestamp: number;
}>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedGroundedResponse(query: string) {
  const cached = groundingCache.get(query);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  // Fetch new response...
  const result = await fetchGroundedResponse(query);

  groundingCache.set(query, {
    ...result,
    timestamp: Date.now(),
  });

  return result;
}
```

### 7. 検索クエリのログ記録
`src/lib/utils/log-search-queries.ts`:
```typescript
export function logSearchQueries(
  userQuery: string,
  searchQueries: string[]
) {
  console.log('User Query:', userQuery);
  console.log('Generated Search Queries:', searchQueries);

  // Optional: Save to database for analytics
  // db.logSearchQuery({ userQuery, searchQueries, timestamp: new Date() });
}
```

### 8. エラーハンドリング
```typescript
export async function safeGroundedGenerate(prompt: string) {
  try {
    const client = createVertexAIClient();
    const googleSearchTool: Tool = {
      googleSearch: {} as GoogleSearch,
    };

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [googleSearchTool],
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error('Grounding error:', error);

    // Fallback to non-grounded response
    return {
      success: false,
      error: error.message,
      fallback: true,
    };
  }
}
```

### 9. 型定義
`src/types/chat.ts` に追加:
```typescript
export interface GroundingMetadata {
  searchQueries: string[];
  citations: Citation[];
}

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
}

export interface GroundedChatResponse extends ChatResponse {
  grounding: GroundingMetadata;
}
```

## 完了条件
- [ ] Grounding が正しく動作する
- [ ] Citations が表示される
- [ ] 検索クエリが最適化されている
- [ ] UI が更新されている
- [ ] キャッシュが実装されている
- [ ] エラーハンドリングが実装されている

## 関連チケット
- 前: #016 Vertex AI Gemini 統合
- 次: #018 チャット機能完成
- 関連: #008 AI チャット画面 UI
