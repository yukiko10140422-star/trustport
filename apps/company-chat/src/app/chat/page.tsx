'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ChatMessage } from '@/types';
import type { ModelKey } from '@/lib/constants';
import { MODELS, DEPT_COLORS } from '@/lib/constants';
import { getAllDepartments } from '@/lib/departments';
import { classifyTask } from '@/lib/action-detector';
import { useWorkerStatus } from '@/hooks/useTaskSubscription';
import TabBar from '@/components/TabBar';
import TaskStatus from '@/components/TaskStatus';

const departments = getAllDepartments();

function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'こんにちは！秘書のひなたです。\n何でも聞いてくださいね！',
      departmentId: 'secretary',
      departmentName: '秘書室',
      person: '藤崎 ひなた',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelKey>('haiku');
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: genId(), role: 'user', content: text, timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role, content: m.content,
    }));

    const classification = classifyTask(text);

    try {
      if (classification.weight === 'heavy') {
        // 重作業 → Supabaseタスクキューに登録
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, departmentId: selectedDept || undefined }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');

        if (data.offline) {
          // ワーカーオフライン
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant', content: data.message,
            departmentId: 'secretary', departmentName: '秘書室',
            person: '藤崎 ひなた', timestamp: Date.now(),
          }]);
        } else {
          // タスク登録成功
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant',
            content: `${data.departmentName}の${data.person}さんに作業を依頼しました！`,
            departmentId: 'secretary', departmentName: '秘書室',
            person: '藤崎 ひなた', timestamp: Date.now(),
          }]);
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant',
            content: '',
            departmentId: data.departmentId,
            departmentName: data.departmentName,
            person: data.person,
            model: 'task-queue',
            taskId: data.taskId,
            timestamp: Date.now(),
          }]);
        }
      } else {
        // 軽作業・チャット → Claude API
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            model,
            history,
            departmentId: selectedDept || undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');

        if (data.routingMessage) {
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant', content: data.routingMessage,
            departmentId: 'secretary', departmentName: '秘書室',
            person: '藤崎 ひなた', timestamp: Date.now(),
          }]);
        }

        setMessages(prev => [...prev, {
          id: genId(), role: 'assistant', content: data.text,
          departmentId: data.departmentId, departmentName: data.departmentName,
          person: data.person, model: data.model, timestamp: Date.now(),
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: genId(), role: 'assistant',
        content: 'すみません、エラーが発生しました。もう一度お試しください。',
        departmentId: 'secretary', departmentName: '秘書室',
        person: '藤崎 ひなた', timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setSelectedDept('');
    }
  }, [input, loading, model, messages, selectedDept]);

  if (status !== 'authenticated') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700,
          }}>秘</div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Company 秘書室</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            style={{
              padding: '4px 10px', borderRadius: 16, fontSize: 12, fontWeight: 600,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', cursor: 'pointer',
            }}
          >
            {MODELS[model].label}
          </button>
        </div>
      </header>

      {/* Model Picker */}
      {showModelPicker && (
        <div style={{
          display: 'flex', gap: 6, padding: '8px 16px',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        }}>
          {(Object.entries(MODELS) as [ModelKey, typeof MODELS[ModelKey]][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => { setModel(key); setShowModelPicker(false); }}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12,
                border: key === model ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: key === model ? 'var(--primary)' : 'var(--surface)',
                color: key === model ? '#fff' : 'var(--text)', cursor: 'pointer',
                fontWeight: key === model ? 700 : 400,
              }}
            >
              <div>{m.label}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
            <span style={{ animation: 'pulse 1s infinite', color: 'var(--text-secondary)' }}>...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Department Picker */}
      {showDeptPicker && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 16px',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          maxHeight: 120, overflowY: 'auto',
        }}>
          <button
            onClick={() => { setSelectedDept(''); setShowDeptPicker(false); }}
            style={{
              padding: '4px 10px', borderRadius: 12, fontSize: 11,
              border: !selectedDept ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer',
            }}
          >
            自動
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelectedDept(d.id); setShowDeptPicker(false); }}
              style={{
                padding: '4px 10px', borderRadius: 12, fontSize: 11,
                border: selectedDept === d.id ? `2px solid ${DEPT_COLORS[d.id]}` : '1px solid var(--border)',
                background: selectedDept === d.id ? DEPT_COLORS[d.id] : 'var(--surface)',
                color: selectedDept === d.id ? '#fff' : 'var(--text)', cursor: 'pointer',
              }}
            >
              {d.name}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <footer style={{
        display: 'flex', alignItems: 'flex-end', gap: 8,
        padding: '8px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
      className="safe-bottom"
      >
        <button
          onClick={() => setShowDeptPicker(!showDeptPicker)}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--border)',
            background: selectedDept ? DEPT_COLORS[selectedDept] : 'var(--surface)',
            color: selectedDept ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14, flexShrink: 0,
          }}
          title="部署を選択"
        >
          {selectedDept ? departments.find(d => d.id === selectedDept)?.name.charAt(0) : '部'}
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="ひなたに聞いてみよう..."
          rows={1}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 20,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 15, resize: 'none',
            maxHeight: 120, lineHeight: 1.4,
            outline: 'none',
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: input.trim() && !loading ? 'var(--primary)' : 'var(--border)',
            border: 'none', color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 18,
          }}
        >
          ↑
        </button>
      </footer>

      <TabBar />
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  const color = msg.departmentId ? DEPT_COLORS[msg.departmentId] || '#666' : '#666';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 12,
    }}>
      {!isUser && msg.person && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%', background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 10, fontWeight: 700,
          }}>
            {msg.person.charAt(msg.person.indexOf(' ') + 1) || msg.person.charAt(0)}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {msg.person}
            {msg.departmentName && ` (${msg.departmentName})`}
          </span>
          {msg.model && (
            <span style={{
              fontSize: 10, padding: '1px 6px', borderRadius: 8,
              background: 'var(--border)', color: 'var(--text-secondary)',
            }}>
              {msg.model}
            </span>
          )}
        </div>
      )}

      <div style={{
        maxWidth: '80%', padding: msg.taskId ? '4px' : '10px 14px', borderRadius: 18,
        background: isUser ? 'var(--user-bubble)' : msg.taskId ? 'transparent' : 'var(--surface)',
        color: isUser ? '#fff' : 'var(--text)',
        border: isUser ? 'none' : msg.taskId ? 'none' : '1px solid var(--border)',
        fontSize: 15, lineHeight: 1.5, whiteSpace: 'pre-wrap',
        borderBottomRightRadius: isUser ? 4 : 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
      }}>
        {msg.taskId ? <TaskStatus taskId={msg.taskId} /> : msg.content}
      </div>
    </div>
  );
}
