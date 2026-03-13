'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeExternalUrl } from '@/lib/url';

type Props = {
  readonly content: string;
  readonly className?: string;
};

export function MarkdownRenderer({ content, className = '' }: Props) {
  return (
    <div className={`prose-yura ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="font-serif text-xl text-accent mt-8 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-serif text-lg text-foreground/80 mt-6 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-foreground/70 text-sm leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-foreground/70 text-sm space-y-1 mb-4 ml-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-foreground/70 text-sm space-y-1 mb-4 ml-2">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-accent/30 pl-4 italic text-foreground/50 my-4">{children}</blockquote>
          ),
          a: ({ href, children }) => {
            const safeHref = sanitizeExternalUrl(href);
            if (!safeHref) {
              return <span className="text-foreground/70">{children}</span>;
            }
            return (
              <a
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-dim underline underline-offset-2 transition-colors"
              >
                {children}
              </a>
            );
          },
          strong: ({ children }) => (
            <strong className="text-foreground/90 font-semibold">{children}</strong>
          ),
        }}
      />
    </div>
  );
}
