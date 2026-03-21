'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import TabBar from '@/components/TabBar';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  location: string;
}

function formatTime(iso: string, allDay: boolean): string {
  if (allDay) return '終日';
  const d = new Date(iso);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
}

export default function CalendarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') loadEvents();
  }, [status, loadEvents]);

  const addEvent = async () => {
    if (!newTitle || !newDate) return;
    const start = newTime
      ? `${newDate}T${newTime}:00+09:00`
      : newDate;

    await fetch('/api/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, start, allDay: !newTime }),
    });
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setShowAdd(false);
    loadEvents();
  };

  if (status !== 'authenticated') return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>カレンダー</span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{
            padding: '4px 12px', borderRadius: 16, fontSize: 13,
            border: '1px solid var(--primary)', background: 'var(--surface)',
            color: 'var(--primary)', cursor: 'pointer', fontWeight: 600,
          }}
        >
          + 追加
        </button>
      </header>

      {showAdd && (
        <div style={{
          padding: 16, background: 'var(--surface)',
          borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <input
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="予定のタイトル"
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: 14,
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg)',
                color: 'var(--text)', fontSize: 14,
              }}
            />
            <input
              type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
              placeholder="時間（任意）"
              style={{
                width: 120, padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--bg)',
                color: 'var(--text)', fontSize: 14,
              }}
            />
          </div>
          <button
            onClick={addEvent}
            disabled={!newTitle || !newDate}
            style={{
              padding: '10px', borderRadius: 8, border: 'none',
              background: newTitle && newDate ? 'var(--primary)' : 'var(--border)',
              color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            予定を追加
          </button>
        </div>
      )}

      <main style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>読み込み中...</p>
        ) : events.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>今後7日間の予定はありません</p>
        ) : (
          events.map(event => (
            <div key={event.id} style={{
              padding: '12px 16px', marginBottom: 8, borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--surface)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{event.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                {formatDate(event.start)} {formatTime(event.start, event.allDay)}
                {event.location && ` — ${event.location}`}
              </div>
            </div>
          ))
        )}
      </main>

      <TabBar />
    </div>
  );
}
