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

function getMonthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    label: start.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' }),
    month: start.getMonth(),
    year: start.getFullYear(),
  };
}

function formatTime(iso: string, allDay: boolean): string {
  if (allDay) return '終日';
  const d = new Date(iso);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function getDayOfMonth(iso: string): number {
  return new Date(iso).getDate();
}

function getDayOfWeek(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', { weekday: 'short' });
}

// Group events by date
function groupByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const dateKey = event.start.split('T')[0] || event.start;
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(event);
  }
  return groups;
}

const EVENT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

export default function CalendarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthOffset, setMonthOffset] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    const { timeMin, timeMax } = getMonthRange(monthOffset);
    try {
      const res = await fetch(`/api/calendar?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (e) { console.error('カレンダー読み込み失敗:', e); }
    setLoading(false);
  }, [monthOffset]);

  useEffect(() => {
    if (status === 'authenticated') loadEvents();
  }, [status, loadEvents]);

  const deleteEventById = useCallback(async (eventId: string) => {
    if (!confirm('この予定を削除しますか？')) return;
    try {
      const res = await fetch(`/api/calendar?eventId=${encodeURIComponent(eventId)}`, { method: 'DELETE' });
      if (res.ok) loadEvents();
    } catch (e) { console.error('予定削除失敗:', e); }
  }, [loadEvents]);

  const addEvent = async () => {
    if (!newTitle || !newDate) return;
    const start = newTime ? `${newDate}T${newTime}:00+09:00` : newDate;
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

  const { label } = getMonthRange(monthOffset);
  const grouped = groupByDate(events);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 640, margin: '0 auto', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '14px 20px',
        background: 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setMonthOffset(v => v - 1)} style={{
              width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{'<'}</button>
            <span style={{ fontWeight: 700, fontSize: 17, letterSpacing: '0.02em', minWidth: 120, textAlign: 'center' }}>{label}</span>
            <button onClick={() => setMonthOffset(v => v + 1)} style={{
              width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{'>'}</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {monthOffset !== 0 && (
              <button onClick={() => setMonthOffset(0)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
                color: '#fff', cursor: 'pointer',
              }}>今月</button>
            )}
            <button onClick={() => setShowAdd(!showAdd)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)',
              color: '#fff', cursor: 'pointer',
            }}>+ 追加</button>
          </div>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
          {events.length}件の予定
        </div>
      </header>

      {/* Add Event Form */}
      {showAdd && (
        <div style={{
          padding: 16, background: 'var(--surface)',
          borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8,
          animation: 'slideUp 0.2s ease',
        }}>
          <input
            value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="予定のタイトル"
            style={{
              padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--text)', fontSize: 14, outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{
              flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text)', fontSize: 14,
            }} />
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{
              width: 120, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', background: 'var(--bg)',
              color: 'var(--text)', fontSize: 14,
            }} />
          </div>
          <button onClick={addEvent} disabled={!newTitle || !newDate} style={{
            padding: '12px', borderRadius: 'var(--radius-sm)', border: 'none',
            background: newTitle && newDate
              ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
              : 'var(--border)',
            color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            予定を追加
          </button>
        </div>
      )}

      {/* Events */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 60 }}>
            <span style={{ width: 14, height: 14, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>読み込み中...</span>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>この月の予定はありません</p>
          </div>
        ) : (
          Array.from(grouped.entries()).map(([dateKey, dayEvents], groupIdx) => {
            const isToday = dateKey === today;
            return (
              <div key={dateKey} style={{ marginBottom: 20, animation: `fadeIn 0.3s ease ${groupIdx * 0.05}s both` }}>
                {/* Date Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8,
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: isToday
                      ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                      : 'var(--surface)',
                    color: isToday ? '#fff' : 'var(--text)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, boxShadow: isToday ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    border: isToday ? 'none' : '1px solid var(--border-light)',
                  }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{getDayOfMonth(dayEvents[0].start)}</span>
                    <span style={{ fontSize: 9, opacity: 0.8, marginTop: 1 }}>{getDayOfWeek(dayEvents[0].start)}</span>
                  </div>
                  {isToday && (
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 12,
                      background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 600,
                    }}>TODAY</span>
                  )}
                </div>

                {/* Events for this date */}
                {dayEvents.map((event, i) => (
                  <div key={event.id} style={{
                    display: 'flex', gap: 12, marginLeft: 20, marginBottom: 6,
                  }}>
                    <div style={{
                      width: 3, borderRadius: 2, flexShrink: 0,
                      background: EVENT_COLORS[i % EVENT_COLORS.length],
                    }} />
                    <div style={{
                      flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--surface)', border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{event.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{formatTime(event.start, event.allDay)}</span>
                          {event.location && (
                            <>
                              <span style={{ opacity: 0.4 }}>|</span>
                              <span>{event.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEventById(event.id)}
                        style={{
                          border: 'none', background: 'none', cursor: 'pointer',
                          color: 'var(--text-tertiary)', padding: 4, borderRadius: 6,
                          flexShrink: 0,
                        }}
                        title="削除"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </main>

      <TabBar />
    </div>
  );
}
