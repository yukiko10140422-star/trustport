import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeTool } from '../handlers';

// Mock service modules
vi.mock('../calendar-service', () => ({
  listEvents: vi.fn().mockResolvedValue([
    { id: '1', title: '会議', start: '2026-03-21T14:00:00', end: '2026-03-21T15:00:00', allDay: false, location: '' },
  ]),
  createEvent: vi.fn().mockResolvedValue({ id: 'new-1', title: '新会議', start: '2026-03-25T10:00:00' }),
}));

vi.mock('../todo-service', () => ({
  listTodos: vi.fn().mockResolvedValue([
    { id: 't1', title: 'タスク1', completed: false, due: null, notes: '' },
  ]),
  createTodo: vi.fn().mockResolvedValue({ id: 'new-t1', title: '新タスク' }),
  completeTodo: vi.fn().mockResolvedValue(undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('executeTool', () => {
  it('should handle get_calendar_events', async () => {
    const result = await executeTool(
      'get_calendar_events',
      { timeMin: '2026-03-01', timeMax: '2026-03-31' },
      'fake-token',
    );

    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('会議');
  });

  it('should handle create_calendar_event', async () => {
    const result = await executeTool(
      'create_calendar_event',
      { title: '新会議', start: '2026-03-25T10:00:00' },
      'fake-token',
    );

    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('new-1');
  });

  it('should handle get_todos', async () => {
    const result = await executeTool('get_todos', {}, 'fake-token');

    const parsed = JSON.parse(result);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].title).toBe('タスク1');
  });

  it('should handle create_todo', async () => {
    const result = await executeTool(
      'create_todo',
      { title: '新タスク' },
      'fake-token',
    );

    const parsed = JSON.parse(result);
    expect(parsed.id).toBe('new-t1');
  });

  it('should handle complete_todo', async () => {
    const result = await executeTool(
      'complete_todo',
      { taskId: 't1', completed: true },
      'fake-token',
    );

    const parsed = JSON.parse(result);
    expect(parsed.ok).toBe(true);
  });

  it('should return error for unknown tool', async () => {
    const result = await executeTool('unknown_tool', {}, 'fake-token');

    const parsed = JSON.parse(result);
    expect(parsed.error).toContain('不明なツール');
  });

  it('should return error when accessToken is missing', async () => {
    const result = await executeTool('get_calendar_events', {}, '');

    const parsed = JSON.parse(result);
    expect(parsed.error).toContain('認証');
  });
});
