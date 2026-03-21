'use client';

import React, { useState } from 'react';

export default function CodeBlock(props: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
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
        borderRadius: 8, overflow: 'hidden', margin: '8px 0',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          padding: '4px 12px', fontSize: 10, fontWeight: 600,
          color: 'var(--text-tertiary)', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>{className?.replace('language-', '')}</span>
          <button
            data-testid="copy-btn"
            onClick={handleCopy}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 10,
              color: copied ? 'var(--success)' : 'var(--text-tertiary)',
              fontWeight: 500, padding: '2px 6px', borderRadius: 4,
              transition: 'color 0.2s',
            }}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre style={{
          padding: 12, margin: 0, overflow: 'auto',
          fontSize: 13, lineHeight: 1.5,
          background: '#1e1e2e', color: '#cdd6f4',
        }}>
          <code {...rest}>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <code
      style={{
        background: 'var(--primary-bg)', padding: '2px 6px',
        borderRadius: 4, fontSize: '0.9em',
        color: 'var(--primary)', fontWeight: 500,
      }}
      {...rest}
    >
      {children}
    </code>
  );
}
