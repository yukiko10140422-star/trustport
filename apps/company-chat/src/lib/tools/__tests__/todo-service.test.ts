import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listTodos, createTodo, completeTodo } from '../todo-service';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper: mock getDefaultTaskList + actual API call
function mockTaskListThenApi(apiResponse: object) {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [{ id: 'list-1' }] }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => apiResponse,
    });
}

describe('listTodos', () => {
  it('should return formatted todos', async () => {
    mockTaskListThenApi({
      items: [
        { id: 't1', title: '報告書作成', status: 'needsAction', due: '2026-03-25T00:00:00Z', notes: 'メモ' },
        { id: 't2', title: '完了済み', status: 'completed' },
      ],
    });

    const todos = await listTodos('fake-token');

    expect(todos).toHaveLength(2);
    expect(todos[0]).toEqual({
      id: 't1',
      title: '報告書作成',
      completed: false,
      due: '2026-03-25T00:00:00Z',
      notes: 'メモ',
    });
    expect(todos[1].completed).toBe(true);
  });

  it('should return empty array when no tasks', async () => {
    mockTaskListThenApi({ items: undefined });

    const todos = await listTodos('fake-token');
    expect(todos).toEqual([]);
  });
});

describe('createTodo', () => {
  it('should create a todo with title', async () => {
    mockTaskListThenApi({ id: 'new-t1', title: '新タスク' });

    const result = await createTodo('fake-token', { title: '新タスク' });

    expect(result.id).toBe('new-t1');
    expect(result.title).toBe('新タスク');
  });

  it('should include due date when provided', async () => {
    mockTaskListThenApi({ id: 'new-t2', title: 'テスト' });

    await createTodo('fake-token', { title: 'テスト', due: '2026-04-01' });

    const fetchBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(fetchBody.due).toBeDefined();
  });
});

describe('completeTodo', () => {
  it('should mark todo as completed', async () => {
    mockTaskListThenApi({ ok: true });

    await completeTodo('fake-token', { taskId: 't1', completed: true });

    const fetchBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(fetchBody.status).toBe('completed');
  });

  it('should mark todo as incomplete', async () => {
    mockTaskListThenApi({ ok: true });

    await completeTodo('fake-token', { taskId: 't1', completed: false });

    const fetchBody = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(fetchBody.status).toBe('needsAction');
  });
});
