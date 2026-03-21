'use client';

import { useState, useEffect, useCallback } from 'react';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  currentId: string | null;
  onSelect: (id: string | null) => void;
}

export default function ConversationDrawer({ open, onClose, currentId, onSelect }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('この会話を削除しますか？')) return;
    await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentId === id) onSelect(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'たった今';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}時間前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}日前`;
    return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
            zIndex: 100, transition: 'opacity 0.2s',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: 'min(300px, 80vw)',
        background: 'var(--surface)',
        zIndex: 101,
        transform: open ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        display: 'flex', flexDirection: 'column',
        boxShadow: open ? 'var(--shadow-lg)' : 'none',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>会話履歴</h2>
            <button
              onClick={onClose}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 20, color: 'var(--text-tertiary)', padding: 4,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* New conversation button */}
        <button
          onClick={() => { onSelect(null); onClose(); }}
          style={{
            margin: '12px 16px 8px',
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px dashed var(--primary)',
            background: 'var(--primary-bg)',
            color: 'var(--primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          + 新しい会話
        </button>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {loading && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              読み込み中...
            </div>
          )}
          {!loading && conversations.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
              まだ会話がありません
            </div>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => { onSelect(conv.id); onClose(); }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: currentId === conv.id ? 'var(--primary-bg)' : 'transparent',
                borderLeft: currentId === conv.id ? '3px solid var(--primary)' : '3px solid transparent',
                transition: 'all 0.15s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: 8,
              }}
            >
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: 13, fontWeight: currentId === conv.id ? 600 : 400,
                  color: 'var(--text)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {conv.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {formatDate(conv.updated_at)}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(conv.id, e)}
                style={{
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontSize: 14, padding: '4px 6px',
                  borderRadius: 6, flexShrink: 0,
                  transition: 'color 0.2s',
                }}
                title="削除"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
