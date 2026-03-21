import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';

const TASKS_API = 'https://tasks.googleapis.com/tasks/v1';

async function getDefaultTaskList(token: string): Promise<string> {
  const res = await fetch(`${TASKS_API}/users/@me/lists?maxResults=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.items?.[0]?.id || '@default';
}

export async function GET(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = auth.accessToken;

  const listId = await getDefaultTaskList(token);
  const res = await fetch(
    `${TASKS_API}/lists/${listId}/tasks?showCompleted=true&showHidden=false&maxResults=50`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Tasks API error' }, { status: res.status });
  }

  const data = await res.json();
  const tasks = (data.items || []).map((t: any) => ({
    id: t.id,
    title: t.title || '',
    completed: t.status === 'completed',
    due: t.due || null,
    notes: t.notes || '',
  }));

  return NextResponse.json({ tasks, listId });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = auth.accessToken;

  const body = await req.json();
  const { title, due, notes } = body;

  if (!title) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  const listId = await getDefaultTaskList(token);
  const task: any = { title };
  if (due) task.due = new Date(due).toISOString();
  if (notes) task.notes = notes;

  const res = await fetch(`${TASKS_API}/lists/${listId}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: res.status });
  }

  const created = await res.json();
  return NextResponse.json({ id: created.id, title: created.title });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth?.accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const token = auth.accessToken;

  const body = await req.json();
  const { taskId, completed } = body;

  if (!taskId) {
    return NextResponse.json({ error: 'taskId required' }, { status: 400 });
  }

  const listId = await getDefaultTaskList(token);
  const update: any = { status: completed ? 'completed' : 'needsAction' };
  if (!completed) update.completed = null;

  const res = await fetch(`${TASKS_API}/lists/${listId}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: res.status });
  }

  return NextResponse.json({ ok: true });
}
