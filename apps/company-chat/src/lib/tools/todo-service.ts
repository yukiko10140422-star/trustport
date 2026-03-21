const TASKS_API = 'https://tasks.googleapis.com/tasks/v1';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  due: string | null;
  notes: string;
}

async function getDefaultTaskList(token: string): Promise<string> {
  const res = await fetch(`${TASKS_API}/users/@me/lists?maxResults=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.items?.[0]?.id || '@default';
}

export async function listTodos(accessToken: string): Promise<Todo[]> {
  const listId = await getDefaultTaskList(accessToken);
  const res = await fetch(
    `${TASKS_API}/lists/${listId}/tasks?showCompleted=true&showHidden=false&maxResults=50`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!res.ok) {
    throw new Error(`Tasks API error (${res.status})`);
  }

  const data = await res.json();
  return (data.items || []).map((t: Record<string, unknown>) => ({
    id: t.id,
    title: (t.title as string) || '',
    completed: t.status === 'completed',
    due: (t.due as string) || null,
    notes: (t.notes as string) || '',
  }));
}

export async function createTodo(
  accessToken: string,
  params: { title: string; due?: string; notes?: string },
): Promise<{ id: string; title: string }> {
  const listId = await getDefaultTaskList(accessToken);
  const task: Record<string, unknown> = { title: params.title };
  if (params.due) task.due = new Date(params.due).toISOString();
  if (params.notes) task.notes = params.notes;

  const res = await fetch(`${TASKS_API}/lists/${listId}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    throw new Error(`Failed to create task (${res.status})`);
  }

  const created = await res.json();
  return { id: created.id, title: created.title };
}

export async function completeTodo(
  accessToken: string,
  params: { taskId: string; completed: boolean },
): Promise<void> {
  const listId = await getDefaultTaskList(accessToken);
  const update: Record<string, unknown> = {
    status: params.completed ? 'completed' : 'needsAction',
  };
  if (!params.completed) update.completed = null;

  const res = await fetch(`${TASKS_API}/lists/${listId}/tasks/${params.taskId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    throw new Error(`Failed to update task (${res.status})`);
  }
}
