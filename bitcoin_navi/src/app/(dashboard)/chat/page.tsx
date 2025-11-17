'use client';

import { useState } from 'react';
import { ChatMessages } from '@/components/features/chat-messages';
import { ChatInput } from '@/components/features/chat-input';
import { ChatSuggestions } from '@/components/features/chat-suggestions';

export default function ChatPage() {
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message);
    // TODO: Implement API call in #018
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000); // Simulate AI response
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          AI Chat
        </h1>
        <p className="text-muted-foreground mt-1">
          Ask questions about your assets and get AI-powered insights
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col min-h-0 bg-card/30 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          <ChatMessages isTyping={isTyping} />
        </div>

        {/* Suggestions */}
        <ChatSuggestions onSuggestionClick={handleSuggestionClick} />

        {/* Input Area */}
        <div className="border-t border-border/50 py-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </div>
  );
}
