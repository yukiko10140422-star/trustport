'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ChatMessage } from '@/types';
import type { ModelKey } from '@/lib/constants';
import { MODELS, DEPT_COLORS } from '@/lib/constants';
import { getAllDepartments } from '@/lib/departments';
import { classifyTask } from '@/lib/action-detector';
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
      content: 'おはようございます！秘書のひなたです。\n何でも聞いてくださいね。',
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
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, departmentId: selectedDept || undefined }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API error');

        if (data.offline) {
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant', content: data.message,
            departmentId: 'secretary', departmentName: '秘書室',
            person: '藤崎 ひなた', timestamp: Date.now(),
          }]);
        } else {
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant',
            content: `${data.departmentName}の${data.person}さんに作業を依頼しました！`,
            departmentId: 'secretary', departmentName: '秘書室',
            person: '藤崎 ひなた', timestamp: Date.now(),
          }]);
          setMessages(prev => [...prev, {
            id: genId(), role: 'assistant', content: '',
            departmentId: data.departmentId, departmentName: data.departmentName,
            person: data.person, model: 'task-queue', taskId: data.taskId,
            timestamp: Date.now(),
          }]);
        }
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text, model, history,
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700,
          }}>秘</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: '0.02em' }}>Company 秘書室</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>藤崎 ひなた</div>
          </div>
        </div>
        <button
          onClick={() => setShowModelPicker(!showModelPicker)}
          style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
            color: '#fff', cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}
        >
          {MODELS[model].label}
        </button>
      </header>

      {/* Model Picker */}
      {showModelPicker && (
        <div style={{
          display: 'flex', gap: 6, padding: '10px 20px',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          animation: 'fadeIn 0.2s ease',
        }}>
          {(Object.entries(MODELS) as [ModelKey, typeof MODELS[ModelKey]][]).map(([key, m]) => (
            <button
              key={key}
              onClick={() => { setModel(key); setShowModelPicker(false); }}
              style={{
                flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-sm)', fontSize: 12,
                border: key === model ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: key === model ? 'var(--primary-bg)' : 'var(--surface)',
                color: key === model ? 'var(--primary)' : 'var(--text)', cursor: 'pointer',
                fontWeight: key === model ? 700 : 400, transition: 'all 0.2s',
              }}
            >
              <div>{m.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {messages.map((msg, i) => (
          <div key={msg.id} style={{ animation: `fadeIn 0.3s ease ${Math.min(i * 0.05, 0.3)}s both` }}>
            <MessageBubble msg={msg} />
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 0' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--primary)', opacity: 0.4,
                  animation: `pulse 1.4s ${i * 0.2}s infinite ease-in-out`,
                }} />
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>考え中...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Department Picker */}
      {showDeptPicker && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 20px',
          background: 'var(--surface)', borderTop: '1px solid var(--border)',
          maxHeight: 140, overflowY: 'auto', animation: 'slideUp 0.2s ease',
        }}>
          <button
            onClick={() => { setSelectedDept(''); setShowDeptPicker(false); }}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12,
              border: !selectedDept ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: !selectedDept ? 'var(--primary-bg)' : 'var(--surface)',
              color: !selectedDept ? 'var(--primary)' : 'var(--text)', cursor: 'pointer',
              fontWeight: !selectedDept ? 600 : 400,
            }}
          >
            自動
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelectedDept(d.id); setShowDeptPicker(false); }}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12,
                border: selectedDept === d.id ? `2px solid ${DEPT_COLORS[d.id]}` : '1px solid var(--border)',
                background: selectedDept === d.id ? DEPT_COLORS[d.id] : 'var(--surface)',
                color: selectedDept === d.id ? '#fff' : 'var(--text)', cursor: 'pointer',
                fontWeight: selectedDept === d.id ? 600 : 400, transition: 'all 0.2s',
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
        padding: '10px 16px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
      className="safe-bottom"
      >
        <button
          onClick={() => setShowDeptPicker(!showDeptPicker)}
          style={{
            width: 38, height: 38, borderRadius: '50%', border: '1px solid var(--border)',
            background: selectedDept ? DEPT_COLORS[selectedDept] : 'var(--surface)',
            color: selectedDept ? '#fff' : 'var(--text-tertiary)',
            cursor: 'pointer', fontSize: 13, flexShrink: 0, transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)',
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
            flex: 1, padding: '10px 16px', borderRadius: 22,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 15, resize: 'none',
            maxHeight: 120, lineHeight: 1.4, outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = '0 0 0 3px var(--primary-bg)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: input.trim() && !loading
              ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
              : 'var(--border)',
            border: 'none', color: '#fff', cursor: input.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s',
            boxShadow: input.trim() && !loading ? 'var(--shadow-md)' : 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </footer>

      <TabBar />
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
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
          {msg.model && (
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

      <div style={{
        maxWidth: '85%', padding: msg.taskId ? '4px' : '12px 16px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
          : msg.taskId ? 'transparent' : 'var(--surface)',
        color: isUser ? '#fff' : 'var(--text)',
        border: isUser ? 'none' : msg.taskId ? 'none' : '1px solid var(--border-light)',
        fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap',
        boxShadow: isUser ? 'var(--shadow-md)' : msg.taskId ? 'none' : 'var(--shadow-sm)',
      }}>
        {msg.taskId ? <TaskStatus taskId={msg.taskId} /> : msg.content}
      </div>
    </div>
  );
}
