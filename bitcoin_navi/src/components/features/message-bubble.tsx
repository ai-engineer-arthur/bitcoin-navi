import { User, Bot, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Citation {
  title: string;
  url: string;
}

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export function MessageBubble({ role, content, timestamp, citations }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-gradient-to-br from-primary to-accent'
          : 'bg-gradient-to-br from-muted to-muted/50'
        }
        relative group
      `}>
        {isUser ? (
          <User size={18} className="text-white relative z-10" />
        ) : (
          <Bot size={18} className="text-foreground relative z-10" />
        )}
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full blur-md
          opacity-0 group-hover:opacity-30 transition-opacity duration-300
          ${isUser
            ? 'bg-gradient-to-r from-primary to-accent'
            : 'bg-muted'
          }
        `} />
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`
          rounded-2xl p-4 backdrop-blur-sm
          ${isUser
            ? 'bg-gradient-to-br from-primary to-accent text-white'
            : 'bg-card/50 border border-border/50 text-foreground'
          }
          shadow-lg
        `}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="text-sm prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                  li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-bold text-primary" {...props} />,
                  em: ({ node, ...props }) => <em className="italic" {...props} />,
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                    ) : (
                      <code className="block bg-muted/50 p-2 rounded text-xs font-mono overflow-x-auto" {...props} />
                    ),
                  pre: ({ node, ...props }) => <pre className="bg-muted/30 p-3 rounded-lg mb-2 overflow-x-auto" {...props} />,
                  a: ({ node, ...props }) => (
                    <a className="text-primary hover:text-accent underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
                  ),
                  hr: ({ node, ...props }) => <hr className="my-4 border-border/50" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="mt-2 space-y-1 px-2">
            <p className="text-xs text-muted-foreground font-medium">Sources:</p>
            {citations.map((citation, index) => (
              <a
                key={index}
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center gap-1.5 text-xs text-primary
                  hover:text-accent transition-colors
                  hover:underline group/link
                "
              >
                <ExternalLink size={12} className="group-hover/link:scale-110 transition-transform" />
                {citation.title}
              </a>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs text-muted-foreground mt-1.5 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
}
