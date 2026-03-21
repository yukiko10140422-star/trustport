'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="rich-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          table({ children }) {
            return (
              <div style={{ overflow: 'auto', margin: '8px 0', borderRadius: 8, border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th style={{
                padding: '8px 12px', textAlign: 'left', background: 'var(--surface)',
                fontWeight: 600, fontSize: 12, borderBottom: '2px solid var(--border)',
                whiteSpace: 'nowrap',
              }}>{children}</th>
            );
          },
          td({ children }) {
            return <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-light)' }}>{children}</td>;
          },
          h1({ children }) {
            return <h1 style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 8px', lineHeight: 1.3 }}>{children}</h1>;
          },
          h2({ children }) {
            return <h2 style={{ fontSize: 17, fontWeight: 700, margin: '10px 0 6px', lineHeight: 1.3 }}>{children}</h2>;
          },
          h3({ children }) {
            return <h3 style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 4px', lineHeight: 1.3 }}>{children}</h3>;
          },
          ul({ children }) {
            return <ul style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ul>;
          },
          ol({ children }) {
            return <ol style={{ paddingLeft: 20, margin: '6px 0' }}>{children}</ol>;
          },
          li({ children }) {
            return <li style={{ margin: '3px 0', lineHeight: 1.5 }}>{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote style={{
                borderLeft: '3px solid var(--primary)', paddingLeft: 12,
                margin: '8px 0', color: 'var(--text-secondary)', fontStyle: 'italic',
              }}>{children}</blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{children}</a>
            );
          },
          strong({ children }) {
            return <strong style={{ fontWeight: 700, color: 'var(--text)' }}>{children}</strong>;
          },
          hr() {
            return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />;
          },
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
