'use client';

import type { ChatMessage } from '@/types';
import { DEPT_COLORS, TOOL_LABELS } from '@/lib/constants';
import TaskStatus from './TaskStatus';
import RichContent from './RichContent';

export default function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const color = msg.departmentId ? DEPT_COLORS[msg.departmentId] || 'var(--text-secondary)' : 'var(--text-secondary)';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14,
    }}>
      {!isUser && msg.person && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}, ${color}dd)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 11, fontWeight: 700,
            boxShadow: 'var(--shadow-sm)',
          }}>
            {msg.person.charAt(msg.person.indexOf(' ') + 1) || msg.person.charAt(0)}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>
            {msg.person}
            {msg.departmentName && <span style={{ opacity: 0.7 }}> / {msg.departmentName}</span>}
          </span>
          {msg.model && msg.model !== 'task-queue' && (
            <span style={{
              fontSize: 9, padding: '2px 7px', borderRadius: 10,
              background: 'var(--primary-bg)', color: 'var(--primary)',
              fontWeight: 600, letterSpacing: '0.02em',
            }}>
              {msg.model}
            </span>
          )}
        </div>
      )}

      {/* ツール実行インジケーター */}
      {msg.toolsRunning && msg.toolsRunning.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
          borderRadius: 12, background: 'var(--primary-bg)', marginBottom: 6,
          fontSize: 12, color: 'var(--primary)', fontWeight: 500,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)',
            animation: 'pulse 1s infinite',
          }} />
          {msg.toolsRunning.map(t => TOOL_LABELS[t] || t).join(', ')}
        </div>
      )}

      <div style={{
        maxWidth: isUser ? '85%' : '95%',
        padding: msg.taskId ? '4px' : '12px 16px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
          : msg.taskId ? 'transparent' : 'var(--surface)',
        color: isUser ? '#fff' : 'var(--text)',
        border: isUser ? 'none' : msg.taskId ? 'none' : '1px solid var(--border-light)',
        fontSize: 15, lineHeight: 1.6,
        boxShadow: isUser ? 'var(--shadow-md)' : msg.taskId ? 'none' : 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        {/* ユーザーの添付画像 */}
        {isUser && (msg as ChatMessage & { imageUrl?: string }).imageUrl && (
          <img
            src={(msg as ChatMessage & { imageUrl?: string }).imageUrl}
            alt="添付画像"
            style={{
              maxWidth: '100%', borderRadius: 8, marginBottom: 8,
              display: 'block',
            }}
          />
        )}

        {msg.taskId ? (
          <TaskStatus taskId={msg.taskId} />
        ) : isUser ? (
          <span style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</span>
        ) : (
          <RichContent content={msg.content} />
        )}

        {/* ストリーミング中カーソル */}
        {msg.streaming && (
          <span style={{
            display: 'inline-block', width: 2, height: 16,
            background: 'var(--primary)', marginLeft: 2,
            animation: 'blink 1s infinite',
            verticalAlign: 'middle',
          }} />
        )}
      </div>
    </div>
  );
}
