'use client';

import { useMemo, useState, useRef, useEffect } from 'react';

interface ArtifactBlock {
  type: 'html';
  title?: string;
  content: string;
}

export type { ArtifactBlock };

export default function ArtifactFrame({ artifact }: { artifact: ArtifactBlock }) {
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
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--border)', background: '#fff',
      marginTop: 8, marginBottom: 8,
    }}>
      {artifact.title && (
        <div style={{
          padding: '8px 14px', fontSize: 12, fontWeight: 600,
          color: 'var(--text-secondary)', background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
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
          width: '100%', height, border: 'none',
          display: 'block', transition: 'height 0.3s ease',
        }}
        title={artifact.title || 'artifact'}
      />
    </div>
  );
}
