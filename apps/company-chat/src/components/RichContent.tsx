'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Artifact block detection ---
// Claudeが ~~~artifact:html ... ~~~ で囲んだ部分をアーティファクトとして描画

interface ArtifactBlock {
  type: 'html';
  title?: string;
  content: string;
}

interface ContentSegment {
  kind: 'text' | 'artifact';
  text?: string;
  artifact?: ArtifactBlock;
}

const ARTIFACT_REGEX = /~~~artifact(?::(\w+))?(?:\s+title="([^"]*)")?\n([\s\S]*?)~~~/g;

function parseContent(raw: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  for (const match of raw.matchAll(ARTIFACT_REGEX)) {
    const before = raw.slice(lastIndex, match.index);
    if (before.trim()) {
      segments.push({ kind: 'text', text: before });
    }
    segments.push({
      kind: 'artifact',
      artifact: {
        type: (match[1] as 'html') || 'html',
        title: match[2],
        content: match[3].trim(),
      },
    });
    lastIndex = (match.index ?? 0) + match[0].length;
  }

  const remaining = raw.slice(lastIndex);
  if (remaining.trim()) {
    segments.push({ kind: 'text', text: remaining });
  }

  return segments.length > 0 ? segments : [{ kind: 'text', text: raw }];
}

// --- Sandboxed HTML iframe ---

function ArtifactFrame({ artifact }: { artifact: ArtifactBlock }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(300);
  const [expanded, setExpanded] = useState(false);

  const srcdoc = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; background: transparent; color: #1a1a1a; }
  @media (prefers-color-scheme: dark) { body { color: #e0e0e0; } }
</style>
</head>
<body>
${artifact.content}
<script>
  const sendHeight = () => {
    const h = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: 'artifact-height', height: h }, '*');
  };
  new ResizeObserver(sendHeight).observe(document.body);
  sendHeight();
</script>
</body>
</html>`;
  }, [artifact.content]);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'artifact-height' && iframeRef.current) {
        // iframe からの高さメッセージが来たら反映
        const source = e.source as Window | null;
        if (source === iframeRef.current.contentWindow) {
          setHeight(Math.min(Math.max(e.data.height + 8, 100), expanded ? 2000 : 600));
        }
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [expanded]);

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      background: '#fff',
      marginTop: 8,
      marginBottom: 8,
    }}>
      {artifact.title && (
        <div style={{
          padding: '8px 14px',
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{artifact.title}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 11, color: 'var(--primary)', fontWeight: 500,
            }}
          >
            {expanded ? '縮小' : '拡大'}
          </button>
        </div>
      )}
      <iframe
        ref={iframeRef}
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height,
          border: 'none',
          display: 'block',
          transition: 'height 0.3s ease',
        }}
        title={artifact.title || 'artifact'}
      />
    </div>
  );
}

// --- Code Block with Copy Button ---

function CodeBlock(props: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const { className, children, ...rest } = props;
  const [copied, setCopied] = useState(false);
  const isBlock = className?.startsWith('language-');

  if (isBlock) {
    const codeText = String(children || '');

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(codeText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
        const textarea = document.createElement('textarea');
        textarea.value = codeText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div style={{
        borderRadius: 8,
        overflow: 'hidden',
        margin: '8px 0',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          padding: '4px 12px',
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{className?.replace('language-', '')}</span>
          <button
            data-testid="copy-btn"
            onClick={handleCopy}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 10,
              color: copied ? 'var(--success)' : 'var(--text-tertiary)',
              fontWeight: 500,
              padding: '2px 6px',
              borderRadius: 4,
              transition: 'color 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre style={{
          padding: 12,
          margin: 0,
          overflow: 'auto',
          fontSize: 13,
          lineHeight: 1.5,
          background: '#1e1e2e',
          color: '#cdd6f4',
        }}>
          <code {...rest}>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <code
      style={{
        background: 'var(--primary-bg)',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: '0.9em',
        color: 'var(--primary)',
        fontWeight: 500,
      }}
      {...rest}
    >
      {children}
    </code>
  );
}

// --- Markdown Renderer ---

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="rich-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          // Tables
          table({ children }) {
            return (
              <div style={{ overflow: 'auto', margin: '8px 0', borderRadius: 8, border: '1px solid var(--border)' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13,
                }}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th style={{
                padding: '8px 12px',
                textAlign: 'left',
                background: 'var(--surface)',
                fontWeight: 600,
                fontSize: 12,
                borderBottom: '2px solid var(--border)',
                whiteSpace: 'nowrap',
              }}>
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td style={{
                padding: '8px 12px',
                borderBottom: '1px solid var(--border-light)',
              }}>
                {children}
              </td>
            );
          },
          // Headings
          h1({ children }) {
            return <h1 style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 8px', lineHeight: 1.3 }}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 style={{ fontSize: 17, fontWeight: 700, margin: '10px 0 6px', lineHeight: 1.3 }}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 4px', lineHeight: 1.3 }}>{children}</h3>;
          },
          // Lists
          ul({ children }) {
            return <ul style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ul>;
          },
          ol({ children }) {
            return <ol style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ol>;
          },
          li({ children }) {
            return <li style={{ margin: '3px 0', lineHeight: 1.5 }}>{children}</li>;
          },
          // Blockquote
          blockquote({ children }) {
            return (
              <blockquote style={{
                borderLeft: '3px solid var(--primary)',
                paddingLeft: 12,
                margin: '8px 0',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
              }}>
                {children}
              </blockquote>
            );
          },
          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}
              >
                {children}
              </a>
            );
          },
          // Strong / em
          strong({ children }) {
            return <strong style={{ fontWeight: 700, color: 'var(--text)' }}>{children}</strong>;
          },
          // Horizontal rule
          hr() {
            return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />;
          },
          // Paragraphs
          p({ children }) {
            return <p style={{ margin: '4px 0', lineHeight: 1.6 }}>{children}</p>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// --- Main Component ---

export default function RichContent({ content }: { content: string }) {
  const segments = useMemo(() => parseContent(content), [content]);

  return (
    <div>
      {segments.map((seg, i) => {
        if (seg.kind === 'artifact' && seg.artifact) {
          return <ArtifactFrame key={i} artifact={seg.artifact} />;
        }
        return <MarkdownContent key={i} content={seg.text || ''} />;
      })}
    </div>
  );
}
