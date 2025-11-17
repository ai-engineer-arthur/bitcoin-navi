import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        bg-gradient-to-br from-muted to-muted/50
        relative group
      ">
        <Bot size={18} className="text-foreground relative z-10" />
        {/* Glow effect */}
        <div className="
          absolute inset-0 rounded-full blur-md
          bg-muted opacity-0 group-hover:opacity-30
          transition-opacity duration-300
        " />
      </div>

      {/* Typing Animation */}
      <div className="
        bg-card/50 backdrop-blur-sm border border-border/50
        rounded-2xl p-4 shadow-lg
      ">
        <div className="flex gap-1.5">
          <div
            className="
              w-2 h-2 rounded-full
              bg-gradient-to-r from-primary to-accent
              animate-bounce
            "
            style={{ animationDelay: '0ms' }}
          />
          <div
            className="
              w-2 h-2 rounded-full
              bg-gradient-to-r from-primary to-accent
              animate-bounce
            "
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="
              w-2 h-2 rounded-full
              bg-gradient-to-r from-primary to-accent
              animate-bounce
            "
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
