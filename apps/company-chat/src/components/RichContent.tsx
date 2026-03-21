'use client';

import { useMemo } from 'react';
import ArtifactFrame, { type ArtifactBlock } from './rich/ArtifactFrame';
import MarkdownContent from './rich/MarkdownContent';

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
