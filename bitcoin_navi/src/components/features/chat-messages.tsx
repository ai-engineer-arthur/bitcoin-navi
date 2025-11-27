'use client';

import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: { title: string; url: string }[];
}

interface ChatMessagesProps {
  messages?: Message[];
  isTyping?: boolean;
}

export function ChatMessages({ messages = [], isTyping = false }: ChatMessagesProps) {
  return (
    <div className="space-y-6 p-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>メッセージを送信して、AI との会話を始めましょう 💬</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} {...message} />
        ))
      )}

      {/* Show typing indicator when AI is responding */}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
