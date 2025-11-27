'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessages, type Message } from '@/components/features/chat-messages';
import { ChatInput } from '@/components/features/chat-input';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          // TODO: Add price history data for context
          priceHistory: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();

      console.log('Response data:', {
        answerLength: data.answer?.length || 0,
        groundingInfoCount: data.groundingInfo?.length || 0,
        searchQueriesCount: data.searchQueries?.length || 0,
      });

      // Create assistant message with answer
      const assistantMessageId = `assistant-${Date.now()}`;
      let assistantContent = data.answer || 'No answer generated';

      // Add grounding information (sources) if available
      if (data.groundingInfo && data.groundingInfo.length > 0) {
        assistantContent += '\n\n📚 **参考情報:**\n';
        data.groundingInfo.forEach((info: any, index: number) => {
          assistantContent += `${index + 1}. [${info.title}](${info.uri})\n`;
        });
      }

      // Add search queries if available (for debugging)
      if (data.searchQueries && data.searchQueries.length > 0) {
        console.log('Search queries used:', data.searchQueries);
      }

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: assistantContent,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };


  return (
    <div className="h-full flex flex-col">
      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages messages={messages} isTyping={isTyping} />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 py-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}
