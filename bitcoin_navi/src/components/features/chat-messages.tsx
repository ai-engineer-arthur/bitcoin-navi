'use client';

import { MessageBubble } from './message-bubble';
import { TypingIndicator } from './typing-indicator';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: { title: string; url: string }[];
}

const mockMessages: Message[] = [
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
    content: 'I cannot provide financial advice. However, I can share that Bitcoin has shown positive momentum recently. Consider consulting with a financial advisor for personalized investment guidance.',
    timestamp: '10:32 AM',
  },
];

interface ChatMessagesProps {
  isTyping?: boolean;
}

export function ChatMessages({ isTyping = false }: ChatMessagesProps) {
  return (
    <div className="space-y-6 p-4">
      {mockMessages.map((message) => (
        <MessageBubble key={message.id} {...message} />
      ))}

      {/* Show typing indicator when AI is responding */}
      {isTyping && <TypingIndicator />}
    </div>
  );
}
