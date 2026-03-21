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
    } catch { /* ignore */ }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto' }}>
      <header style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>TODO</span>
        <span style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 8 }}>
          {pending.length}件
        </span>
      </header>

      {/* Add task */}
      <div style={{
        display: 'flex', gap: 8, padding: '12px 16px',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="新しいタスクを追加..."
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text)', fontSize: 14,
          }}
        />
        <button
          onClick={addTask}
          disabled={!newTitle.trim()}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none',
            background: newTitle.trim() ? 'var(--primary)' : 'var(--border)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}
        >
          追加
        </button>
      </div>

      <main style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>読み込み中...</p>
        ) : (
          <>
            {pending.map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} />
            ))}

            {completed.length > 0 && (
              <>
                <div style={{
                  fontSize: 12, color: 'var(--text-secondary)',
                  fontWeight: 600, margin: '16px 0 8px', textTransform: 'uppercase',
                }}>
                  完了済み ({completed.length})
                </div>
                {completed.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </>
            )}

            {tasks.length === 0 && (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>
                タスクはありません
              </p>
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
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px', marginBottom: 6, borderRadius: 12,
        border: '1px solid var(--border)', background: 'var(--surface)',
        cursor: 'pointer',
        opacity: task.completed ? 0.5 : 1,
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        border: task.completed ? 'none' : '2px solid var(--border)',
        background: task.completed ? 'var(--primary)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 14,
      }}>
        {task.completed && '✓'}
      </div>
      <span style={{
        fontSize: 15,
        textDecoration: task.completed ? 'line-through' : 'none',
      }}>
        {task.title}
      </span>
    </div>
  );
}
