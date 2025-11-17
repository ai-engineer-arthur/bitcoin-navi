'use client';

import { Sparkles } from 'lucide-react';

const suggestions = [
  'What is the current Bitcoin price?',
  'Should I invest in BigBear.ai?',
  'Show me price trends for the last week',
  'What are the latest crypto news?',
];

interface ChatSuggestionsProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatSuggestions({ onSuggestionClick }: ChatSuggestionsProps) {
  return (
    <div className="mb-4 px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} className="text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Suggested questions</p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick?.(suggestion)}
            className="
              px-3 py-2
              bg-card/50 backdrop-blur-sm
              border border-border/50
              hover:border-primary/50
              rounded-lg text-sm text-foreground
              transition-all duration-200
              hover:scale-105 hover:shadow-lg
              hover:shadow-primary/10
            "
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
