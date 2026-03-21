'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ChatMessage } from '@/types';
import type { ModelKey } from '@/lib/constants';
import { MODELS, DEPT_COLORS } from '@/lib/constants';
import { getAllDepartments } from '@/lib/departments';
import { classifyTask } from '@/lib/action-detector';
import TabBar from '@/components/TabBar';
import ConversationDrawer from '@/components/ConversationDrawer';
import MessageBubble from '@/components/MessageBubble';
import ImageUpload, { type UploadedImage } from '@/components/ImageUpload';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

const departments = getAllDepartments();

import { createSSEParser } from '@/lib/sse-parser';

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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const speech = useSpeechRecognition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  // 音声認識結果をinputに反映
  useEffect(() => {
    if (speech.transcript) {
      setInput(speech.transcript);
    }
  }, [speech.transcript]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 会話選択ハンドラ
  const handleSelectConversation = useCallback(async (id: string | null) => {
    if (id === null) {
      // 新しい会話
      setConversationId(null);
      setMessages([{
        id: 'welcome', role: 'assistant',
        content: 'おはようございます！秘書のひなたです。\n何でも聞いてくださいね。',
        departmentId: 'secretary', departmentName: '秘書室',
        person: '藤崎 ひなた', timestamp: Date.now(),
      }]);
      return;
    }
    setConversationId(id);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const rows = await res.json();
        const loaded: ChatMessage[] = rows.map((r: {
          id: string; role: 'user' | 'assistant'; content: string;
          department_id: string | null; department_name: string | null;
          person: string | null; model: string | null; image_url: string | null;
          created_at: string;
        }) => ({
          id: r.id,
          role: r.role,
          content: r.content,
          departmentId: r.department_id || undefined,
          departmentName: r.department_name || undefined,
          person: r.person || undefined,
          model: r.model || undefined,
          imageUrl: r.image_url || undefined,
          timestamp: new Date(r.created_at).getTime(),
        }));
        setMessages(loaded.length > 0 ? loaded : [{
          id: 'welcome', role: 'assistant',
          content: 'この会話の続きをどうぞ！',
          departmentId: 'secretary', departmentName: '秘書室',
          person: '藤崎 ひなた', timestamp: Date.now(),
        }]);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const attachedImages = [...images];
    const userMsg: ChatMessage = {
      id: genId(), role: 'user', content: text, timestamp: Date.now(),
      imageUrl: attachedImages.length > 0 ? attachedImages[0].preview : undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImages([]);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
    setLoading(true);

    const history = messages.filter(m => m.id !== 'welcome').map(m => ({
      role: m.role, content: m.content,
    }));

    const classification = classifyTask(text);

    try {
      if (classification.weight === 'heavy') {
        // 重タスクは従来通り
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
        // ストリーミング
        const assistantId = genId();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text, model, history,
            departmentId: selectedDept || undefined,
            conversationId: conversationId || undefined,
            images: attachedImages.map(img => ({ url: img.url, type: img.type })),
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'API error');
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let metaReceived = false;

        const parser = createSSEParser((event, data) => {
          const d = data as Record<string, unknown>;

          switch (event) {
            case 'meta': {
              metaReceived = true;
              if (d.conversationId) {
                setConversationId(d.conversationId as string);
              }
              // ルーティングメッセージがあれば先に表示
              if (d.routingMessage) {
                setMessages(prev => [...prev, {
                  id: genId(), role: 'assistant',
                  content: d.routingMessage as string,
                  departmentId: 'secretary', departmentName: '秘書室',
                  person: '藤崎 ひなた', timestamp: Date.now(),
                }]);
              }
              // アシスタントメッセージの枠を作る
              setMessages(prev => [...prev, {
                id: assistantId, role: 'assistant', content: '',
                departmentId: d.departmentId as string,
                departmentName: d.departmentName as string,
                person: d.person as string,
                model: d.model as string,
                timestamp: Date.now(),
                streaming: true,
              }]);
              break;
            }
            case 'text': {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, content: m.content + (d.text as string) }
                  : m,
              ));
              break;
            }
            case 'tool_start': {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, toolsRunning: d.tools as string[] }
                  : m,
              ));
              break;
            }
            case 'tool_end': {
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, toolsRunning: undefined }
                  : m,
              ));
              break;
            }
            case 'done': {
              if (d.conversationId) {
                setConversationId(d.conversationId as string);
              }
              setMessages(prev => prev.map(m =>
                m.id === assistantId
                  ? { ...m, streaming: false }
                  : m,
              ));
              break;
            }
            case 'error': {
              if (!metaReceived) {
                setMessages(prev => [...prev, {
                  id: assistantId, role: 'assistant',
                  content: `エラー: ${d.error}`,
                  departmentId: 'secretary', departmentName: '秘書室',
                  person: '藤崎 ひなた', timestamp: Date.now(),
                }]);
              } else {
                setMessages(prev => prev.map(m =>
                  m.id === assistantId
                    ? { ...m, content: m.content + `\n\nエラー: ${d.error}`, streaming: false }
                    : m,
                ));
              }
              break;
            }
          }
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(decoder.decode(value, { stream: true }));
        }
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // ユーザーによるキャンセル
      } else {
        setMessages(prev => [...prev, {
          id: genId(), role: 'assistant',
          content: 'すみません、エラーが発生しました。もう一度お試しください。',
          departmentId: 'secretary', departmentName: '秘書室',
          person: '藤崎 ひなた', timestamp: Date.now(),
        }]);
      }
    } finally {
      setLoading(false);
      setSelectedDept('');
      abortRef.current = null;
    }
  }, [input, loading, model, messages, selectedDept, conversationId, images]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  if (status !== 'authenticated') return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh',
      maxWidth: 640, margin: '0 auto', background: 'var(--bg)',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, border: 'none', color: '#fff',
              cursor: 'pointer',
            }}
            title="会話履歴"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
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
        {loading && !messages.some(m => m.streaming) && (
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
            <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>接続中...</span>
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
        display: 'flex', alignItems: 'flex-end', gap: 6,
        padding: '8px 12px', borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        position: 'relative',
      }}
      >
        <ImageUpload
          images={images}
          onAdd={(img) => setImages(prev => [...prev, img])}
          onRemove={(i) => setImages(prev => prev.filter((_, idx) => idx !== i))}
          disabled={loading}
        />

        {/* マイクボタン（音声入力） */}
        {speech.supported && (
          <button
            onClick={() => {
              if (speech.status === 'listening') {
                speech.stop();
              } else {
                speech.reset();
                speech.start();
              }
            }}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              border: speech.status === 'listening' ? '2px solid #ef4444' : '1px solid var(--border)',
              background: speech.status === 'listening' ? 'rgba(239,68,68,0.1)' : 'var(--surface)',
              color: speech.status === 'listening' ? '#ef4444' : 'var(--text-tertiary)',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              animation: speech.status === 'listening' ? 'pulse 1.5s infinite' : 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
            title={speech.status === 'listening' ? '録音停止' : '音声入力'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}

        <button
          onClick={() => setShowDeptPicker(!showDeptPicker)}
          style={{
            width: 34, height: 34, borderRadius: '50%', border: '1px solid var(--border)',
            background: selectedDept ? DEPT_COLORS[selectedDept] : 'var(--surface)',
            color: selectedDept ? '#fff' : 'var(--text-tertiary)',
            cursor: 'pointer', fontSize: 12, flexShrink: 0, transition: 'all 0.2s',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="部署を選択"
        >
          {selectedDept ? departments.find(d => d.id === selectedDept)?.name.charAt(0) : '部'}
        </button>

        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
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

        {loading ? (
          <button
            onClick={handleStop}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#ef4444', border: 'none', color: '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
            }}
            title="停止"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: input.trim()
                ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                : 'var(--border)',
              border: 'none', color: '#fff',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.2s',
              boxShadow: input.trim() ? 'var(--shadow-md)' : 'none',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </footer>

      <TabBar />

      <ConversationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentId={conversationId}
        onSelect={handleSelectConversation}
      />
    </div>
  );
}

