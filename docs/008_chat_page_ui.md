# 008: AI チャット画面 UI

## 概要
Vertex AI Gemini を使用した AI チャット機能の UI を実装する。価格予測や質問に答えるチャットインターフェースを提供する。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

## TODO
- [x] チャットページ作成
- [x] メッセージリストコンポーネント
- [x] メッセージ入力コンポーネント
- [x] タイピングインジケーター
- [x] メッセージバブルコンポーネント
- [x] 引用元（Citations）表示 UI
- [x] サジェスチョン機能 UI

## 実装詳細

### 1. チャットページ
`src/app/(dashboard)/chat/page.tsx`:
```typescript
import { ChatMessages } from '@/components/features/chat-messages';
import { ChatInput } from '@/components/features/chat-input';
import { ChatSuggestions } from '@/components/features/chat-suggestions';

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Chat</h1>
        <p className="text-muted-foreground">
          Ask questions about your assets and get AI-powered insights
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4">
          <ChatMessages />
        </div>

        {/* Suggestions */}
        <ChatSuggestions />

        {/* Input Area */}
        <ChatInput />
      </div>
    </div>
  );
}
```

### 2. メッセージリストコンポーネント
`src/components/features/chat-messages.tsx`:
```typescript
import { MessageBubble } from './message-bubble';

const mockMessages = [
  {
    id: '1',
    role: 'user',
    content: 'What is the current price of Bitcoin?',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Based on the latest data, Bitcoin is currently trading at $45,234.56 USD, with a 24-hour change of +2.34%.',
    timestamp: '10:30 AM',
    citations: [
      { title: 'CoinGecko', url: 'https://coingecko.com' },
    ],
  },
  {
    id: '3',
    role: 'user',
    content: 'Should I buy more Bitcoin now?',
    timestamp: '10:32 AM',
  },
  {
    id: '4',
    role: 'assistant',
    content: 'I cannot provide financial advice. However, I can share that Bitcoin has shown positive momentum recently...',
    timestamp: '10:32 AM',
  },
];

export function ChatMessages() {
  return (
    <div className="space-y-4">
      {mockMessages.map((message) => (
        <MessageBubble key={message.id} {...message} />
      ))}
    </div>
  );
}
```

### 3. メッセージバブルコンポーネント
`src/components/features/message-bubble.tsx`:
```typescript
import { User, Bot, ExternalLink } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: { title: string; url: string }[];
}

export function MessageBubble({ role, content, timestamp, citations }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary' : 'bg-muted'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-lg p-4 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card border border-border'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-xs text-muted-foreground">Sources:</p>
            {citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink size={12} />
                {citation.title}
              </a>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
      </div>
    </div>
  );
}
```

### 4. メッセージ入力コンポーネント
`src/components/features/chat-input.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatInput() {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Send message logic will be implemented in #018
    console.log('Sending message:', message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask a question about your assets..."
        className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button type="submit" disabled={!message.trim()}>
        <Send size={20} />
      </Button>
    </form>
  );
}
```

### 5. タイピングインジケーター
`src/components/features/typing-indicator.tsx`:
```typescript
export function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}
```

### 6. サジェスチョン機能
`src/components/features/chat-suggestions.tsx`:
```typescript
const suggestions = [
  'What is the current Bitcoin price?',
  'Should I invest in BigBear.ai?',
  'Show me price trends for the last week',
  'What are the latest crypto news?',
];

export function ChatSuggestions() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-muted-foreground transition-colors"
          onClick={() => {
            // Handle suggestion click
            console.log('Suggestion clicked:', suggestion);
          }}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
```

## 完了条件
- [x] チャットページが表示される
- [x] メッセージが表示される
- [x] 入力フォームが動作する
- [x] タイピングインジケーターが表示される
- [x] サジェスチョンが動作する
- [x] 引用元が表示される
- [x] レスポンシブ対応している

## 🎉 実装完了（2025-11-13）
AIチャット画面UIの実装が完了しました！

### 実装内容
- **MessageBubble**: ユーザー/AIのメッセージバブル
  - グラデーション効果（ユーザー: primary→accent、AI: muted）
  - ホバーでグロー効果
  - Citations（引用元）表示機能
  - タイムスタンプ表示
- **TypingIndicator**: AI応答中の表示
  - 3つのドットがバウンスアニメーション
  - グラデーション効果
- **ChatMessages**: メッセージリスト
  - メッセージバブルを一覧表示
  - タイピングインジケーター統合
- **ChatSuggestions**: 質問のテンプレート
  - Sparklesアイコン
  - ホバーで拡大 + シャドウ効果
  - クリックで質問を送信
- **ChatInput**: メッセージ入力フォーム
  - Enterで送信、Shift+Enterで改行
  - グラデーションボタン
  - ローディング状態対応
- **Chatページ**: すべてのコンポーネントを統合
  - Client Component化（useState使用）
  - メッセージ送信ロジック
  - タイピング状態管理
  - レスポンシブデザイン

### 未実装（後で実装予定）
- **API連携**: #016（Vertex AI Gemini 統合）、#017（Grounding）、#018（チャット機能実装）で実装予定

## 関連チケット
- 前: #007 アラート設定画面 UI
- 次: #009 Google OAuth 認証実装
- 関連: #016 Vertex AI Gemini 統合
- 関連: #017 Grounding 実装
- 関連: #018 チャット機能実装
