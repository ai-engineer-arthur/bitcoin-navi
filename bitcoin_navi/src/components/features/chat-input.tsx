'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  onSendMessage?: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;

    // Send message logic will be implemented in #018
    onSendMessage?.(message);
    console.log('Sending message:', message);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send on Enter, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 px-4">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your assets..."
        disabled={disabled}
        className="
          flex-1
          bg-card/50 backdrop-blur-sm
          border border-border/50
          rounded-xl px-4 py-3 text-sm
          focus:outline-none focus:ring-2 focus:ring-primary/50
          focus:border-primary/50
          transition-all duration-200
          placeholder:text-muted-foreground
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled}
        className="
          px-4 py-3
          bg-gradient-to-r from-primary to-accent
          hover:shadow-lg hover:shadow-primary/20
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <Send size={20} />
      </Button>
    </form>
  );
}
