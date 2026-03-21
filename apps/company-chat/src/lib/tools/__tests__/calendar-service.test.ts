import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listEvents, createEvent } from '../calendar-service';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listEvents', () => {
  it('should return formatted events', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: '1',
            summary: 'テスト会議',
            start: { dateTime: '2026-03-21T14:00:00+09:00' },
            end: { dateTime: '2026-03-21T15:00:00+09:00' },
            location: '会議室A',
          },
          {
            id: '2',
            summary: '終日イベント',
            start: { date: '2026-03-22' },
            end: { date: '2026-03-23' },
          },
        ],
      }),
    });

    const events = await listEvents('fake-token', '2026-03-01T00:00:00Z', '2026-03-31T23:59:59Z');

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      id: '1',
      title: 'テスト会議',
      start: '2026-03-21T14:00:00+09:00',
      end: '2026-03-21T15:00:00+09:00',
      allDay: false,
      location: '会議室A',
    });
    expect(events[1].allDay).toBe(true);
  });

  it('should throw on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    });

    await expect(listEvents('bad-token', '', '')).rejects.toThrow('Calendar API error');
  });
});

describe('createEvent', () => {
  it('should create a timed event', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'new-1',
        summary: '新しい会議',
        start: { dateTime: '2026-03-25T10:00:00+09:00' },
      }),
    });

    const result = await createEvent('fake-token', {
      title: '新しい会議',
      start: '2026-03-25T10:00:00+09:00',
      end: '2026-03-25T11:00:00+09:00',
    });

    expect(result.id).toBe('new-1');
    expect(result.title).toBe('新しい会議');
  });

  it('should create an all-day event', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'new-2',
        summary: '休暇',
        start: { date: '2026-03-25' },
      }),
    });

    const result = await createEvent('fake-token', {
      title: '休暇',
      start: '2026-03-25',
      allDay: true,
    });

    expect(result.id).toBe('new-2');

    // Verify fetch was called with date (not dateTime)
    const fetchBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(fetchBody.start).toEqual({ date: '2026-03-25' });
  });

  it('should throw on API error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    });

    await expect(
      createEvent('fake-token', { title: 'test', start: 'invalid' }),
    ).rejects.toThrow();
  });
});
