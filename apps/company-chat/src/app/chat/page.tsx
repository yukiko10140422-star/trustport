'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { ChatMessage } from '@/types';
import type { ModelKey } from '@/lib/constants';
import { classifyTask } from '@/lib/action-detector';
import { createSSEParser } from '@/lib/sse-parser';
import { genId, createSecretaryMessage, WELCOME_MESSAGE } from '@/lib/message-helpers';
import type { UploadedImage } from '@/components/ImageUpload';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import TabBar from '@/components/TabBar';
import ConversationDrawer from '@/components/ConversationDrawer';
import MessageBubble from '@/components/MessageBubble';
import ChatHeader from '@/components/ChatHeader';
import ChatInputBar from '@/components/ChatInputBar';

export default function ChatPage() {
  const { status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<ModelKey>('haiku');
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const speech = useSpeechRecognition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 音声認識結果をinputに反映
  useEffect(() => {
    if (speech.transcript) setInput(speech.transcript);
  }, [speech.transcript]);

  // 会話選択ハンドラ
  const handleSelectConversation = useCallback(async (id: string | null) => {
    if (id === null) {
      setConversationId(null);
      setMessages([WELCOME_MESSAGE]);
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
          id: r.id, role: r.role, content: r.content,
          departmentId: r.department_id || undefined,
          departmentName: r.department_name || undefined,
          person: r.person || undefined,
          model: r.model || undefined,
          imageUrl: r.image_url || undefined,
          timestamp: new Date(r.created_at).getTime(),
        }));
        setMessages(loaded.length > 0 ? loaded : [
          createSecretaryMessage('この会話の続きをどうぞ！'),
        ]);
      }
    } catch (e) { console.error('会話読み込み失敗:', e); }
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
          setMessages(prev => [...prev, createSecretaryMessage(data.message)]);
        } else {
          setMessages(prev => [...prev,
            createSecretaryMessage(`${data.departmentName}の${data.person}さんに作業を依頼しました！`),
            {
              id: genId(), role: 'assistant', content: '',
              departmentId: data.departmentId, departmentName: data.departmentName,
              person: data.person, model: 'task-queue', taskId: data.taskId,
              timestamp: Date.now(),
            },
          ]);
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
              if (d.conversationId) setConversationId(d.conversationId as string);
              if (d.routingMessage) {
                setMessages(prev => [...prev, createSecretaryMessage(d.routingMessage as string)]);
              }
              setMessages(prev => [...prev, {
                id: assistantId, role: 'assistant', content: '',
                departmentId: d.departmentId as string,
                departmentName: d.departmentName as string,
                person: d.person as string,
                model: d.model as string,
                timestamp: Date.now(), streaming: true,
              }]);
              break;
            }
            case 'text':
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + (d.text as string) } : m));
              break;
            case 'tool_start':
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, toolsRunning: d.tools as string[] } : m));
              break;
            case 'tool_end':
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, toolsRunning: undefined } : m));
              break;
            case 'done':
              if (d.conversationId) setConversationId(d.conversationId as string);
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, streaming: false } : m));
              break;
            case 'error':
              if (!metaReceived) {
                setMessages(prev => [...prev, createSecretaryMessage(`エラー: ${d.error}`)]);
              } else {
                setMessages(prev => prev.map(m =>
                  m.id === assistantId ? { ...m, content: m.content + `\n\nエラー: ${d.error}`, streaming: false } : m));
              }
              break;
          }
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          parser.feed(decoder.decode(value, { stream: true }));
        }
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setMessages(prev => [...prev,
          createSecretaryMessage('すみません、エラーが発生しました。もう一度お試しください。'),
        ]);
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
      <ChatHeader
        model={model}
        showModelPicker={showModelPicker}
        onToggleModelPicker={() => setShowModelPicker(!showModelPicker)}
        onSelectModel={(key) => { setModel(key); setShowModelPicker(false); }}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

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

      <ChatInputBar
        input={input}
        onInputChange={setInput}
        onSend={sendMessage}
        onStop={handleStop}
        loading={loading}
        selectedDept={selectedDept}
        showDeptPicker={showDeptPicker}
        onToggleDeptPicker={() => setShowDeptPicker(!showDeptPicker)}
        onSelectDept={(id) => { setSelectedDept(id); setShowDeptPicker(false); }}
        images={images}
        onAddImage={(img) => setImages(prev => [...prev, img])}
        onRemoveImage={(i) => setImages(prev => prev.filter((_, idx) => idx !== i))}
        speechSupported={speech.supported}
        speechStatus={speech.status}
        onSpeechToggle={() => {
          if (speech.status === 'listening') { speech.stop(); }
          else { speech.reset(); speech.start(); }
        }}
      />

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
