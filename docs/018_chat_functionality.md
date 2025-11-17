# 018: チャット機能完成

## 概要
AI チャット機能の最終実装。ストリーミングレスポンス、会話履歴、サジェスチョン機能を統合し、完全な UX を提供する。

## 技術スタック
- **Framework**: Next.js 15 App Router
- **AI**: Vertex AI Gemini + Grounding
- **State Management**: React Hooks
- **Storage**: LocalStorage (会話履歴)

## TODO
- [ ] ストリーミングレスポンス UI 実装
- [ ] 会話履歴保存機能
- [ ] サジェスチョン機能実装
- [ ] コピー機能
- [ ] エクスポート機能
- [ ] レスポンシブ対応
- [ ] アクセシビリティ対応

## 実装詳細

### 1. ストリーミング対応 UI
`src/components/features/streaming-message.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';

interface StreamingMessageProps {
  onComplete: (text: string) => void;
}

export function StreamingMessage({ onComplete }: StreamingMessageProps) {
  const [text, setText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) {
      onComplete(text);
    }
  }, [isComplete, text, onComplete]);

  const startStreaming = async (message: string) => {
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setText((prev) => prev + chunk);
      }

      setIsComplete(true);
    } catch (error) {
      console.error('Streaming error:', error);
      setText('Sorry, an error occurred while generating the response.');
      setIsComplete(true);
    }
  };

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="flex-1">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm whitespace-pre-wrap">{text}</p>
          {!isComplete && (
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2. 会話履歴管理
`src/lib/chat/conversation-storage.ts`:
```typescript
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export class ConversationStorage {
  private static STORAGE_KEY = 'bitcoin_navi_conversations';

  static getConversations(): Conversation[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static getConversation(id: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find((c) => c.id === id) || null;
  }

  static saveConversation(conversation: Conversation) {
    const conversations = this.getConversations();
    const index = conversations.findIndex((c) => c.id === conversation.id);

    if (index >= 0) {
      conversations[index] = conversation;
    } else {
      conversations.push(conversation);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
  }

  static deleteConversation(id: string) {
    const conversations = this.getConversations();
    const filtered = conversations.filter((c) => c.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  static generateTitle(firstMessage: string): string {
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  }
}
```

### 3. チャットページ完全版
`src/app/(dashboard)/chat/page.tsx`:
```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageBubble } from '@/components/features/message-bubble';
import { ChatInput } from '@/components/features/chat-input';
import { ChatSuggestions } from '@/components/features/chat-suggestions';
import { ConversationStorage } from '@/lib/chat/conversation-storage';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load or create conversation
    const id = crypto.randomUUID();
    setConversationId(id);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(),
        citations: data.grounding?.citations || [],
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Save conversation
      if (conversationId) {
        ConversationStorage.saveConversation({
          id: conversationId,
          title: ConversationStorage.generateTitle(message),
          messages: [...messages, userMessage, aiMessage],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const conversation = {
      id: conversationId,
      messages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(conversation, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${conversationId}.json`;
    a.click();
  };

  const handleClear = () => {
    if (confirm('Clear this conversation?')) {
      setMessages([]);
      if (conversationId) {
        ConversationStorage.deleteConversation(conversationId);
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Chat</h1>
          <p className="text-muted-foreground">
            Ask questions about your assets and get AI-powered insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleExport}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            <Trash2 size={16} className="mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <h3 className="text-xl font-semibold mb-2">
                Welcome to AI Chat
              </h3>
              <p className="text-muted-foreground max-w-md">
                Ask me anything about your crypto and stock portfolio.
                I have access to real-time web search for the latest information.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} {...message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 0 && (
          <ChatSuggestions onSuggestionClick={handleSendMessage} />
        )}

        {/* Input */}
        <ChatInput onSend={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
```

### 4. サジェスチョン更新
`src/components/features/chat-suggestions.tsx`:
```typescript
interface ChatSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  const suggestions = [
    'What is the current Bitcoin price?',
    'Should I invest in BigBear.ai?',
    'Show me price trends for the last week',
    'What are the latest crypto news?',
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm text-muted-foreground transition-colors"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
```

### 5. コピー機能
`src/components/features/copy-button.tsx`:
```typescript
'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}
```

メッセージバブルに追加:
```typescript
import { CopyButton } from './copy-button';

export function MessageBubble({ role, content, ... }) {
  return (
    <div>
      <div className="rounded-lg p-4 ...">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm whitespace-pre-wrap flex-1">{content}</p>
          {role === 'assistant' && <CopyButton text={content} />}
        </div>
      </div>
    </div>
  );
}
```

### 6. レスポンシブ対応
```css
/* src/app/globals.css */
@media (max-width: 768px) {
  .chat-container {
    padding: 1rem;
  }

  .message-bubble {
    max-width: 85%;
  }

  .chat-input {
    flex-direction: column;
  }
}
```

### 7. アクセシビリティ
```typescript
// ARIA labels
<div role="log" aria-live="polite" aria-label="Chat messages">
  {messages.map((message) => (
    <MessageBubble key={message.id} {...message} />
  ))}
</div>

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Clear input or close modal
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

## 完了条件
- [ ] ストリーミングレスポンスが動作する
- [ ] 会話履歴が保存される
- [ ] サジェスチョンが動作する
- [ ] コピー機能が動作する
- [ ] エクスポート機能が動作する
- [ ] レスポンシブ対応している
- [ ] アクセシビリティ対応している

## 関連チケット
- 前: #017 Grounding 実装
- 関連: #008 AI チャット画面 UI
- 関連: #016 Vertex AI Gemini 統合
- 関連: #017 Grounding 実装

## 🎉 プロジェクト完了
このチケットが完了すると、Bitcoin Navi の全機能が実装完了となります！
