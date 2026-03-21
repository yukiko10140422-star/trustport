'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  due: string | null;
  notes: string;
}

export default function TodosPage() {
  const { status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/todos');
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } catch (e) { console.error('TODO読み込み失敗:', e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadTasks();
  }, [status, loadTasks]);

  const addTask = async () => {
    if (!newTitle.trim()) return;
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });
    setNewTitle('');
    loadTasks();
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t));
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, completed: !completed }),
    });
  };

  if (status !== 'authenticated') return null;

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '14px 20px',
        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        color: '#fff',
      }}>
        <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.02em' }}>TODO</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
          {pending.length}件の未完了タスク
        </div>
      </header>

      {/* Add task */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 20px',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="新しいタスクを追加..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 22,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={addTask}
          disabled={!newTitle.trim()}
          style={{
            padding: '10px 18px', borderRadius: 22, border: 'none',
            background: newTitle.trim()
              ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
              : 'var(--border)',
            color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: newTitle.trim() ? 'var(--shadow-sm)' : 'none',
          }}
        >
          追加
        </button>
      </div>

      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 }}>
            <span style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>読み込み中...</span>
          </div>
        ) : (
          <>
            {pending.map((task, i) => (
              <div key={task.id} style={{ animation: `fadeIn 0.3s ease ${i * 0.03}s both` }}>
                <TaskItem task={task} onToggle={toggleTask} />
              </div>
            ))}

            {completed.length > 0 && (
              <>
                <div style={{
                  fontSize: 11, color: 'var(--text-tertiary)',
                  fontWeight: 600, margin: '20px 0 10px',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                  完了済み ({completed.length})
                </div>
                {completed.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </>
            )}

            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 60 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ margin: '0 auto 12px', opacity: 0.3 }}>
                  <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>タスクはありません</p>
              </div>
            )}
          </>
        )}
      </main>

      <TabBar />
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string, completed: boolean) => void }) {
  return (
    <div
      onClick={() => onToggle(task.id, task.completed)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', marginBottom: 6, borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)', cursor: 'pointer',
        opacity: task.completed ? 0.5 : 1,
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 8, flexShrink: 0,
        border: task.completed ? 'none' : '2px solid var(--border)',
        background: task.completed
          ? 'linear-gradient(135deg, var(--success), #059669)'
          : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 13, transition: 'all 0.2s',
      }}>
        {task.completed && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 15, fontWeight: task.completed ? 400 : 500,
          textDecoration: task.completed ? 'line-through' : 'none',
        }}>
          {task.title}
        </span>
        {task.due && (
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            期限: {new Date(task.due).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
}
