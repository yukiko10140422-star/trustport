import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/api-auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { routeMessage } from '@/lib/router';
import { isHeavyTask } from '@/lib/action-detector';

const HEARTBEAT_TIMEOUT_MS = 60_000; // 60秒以内のハートビートならオンライン

export async function POST(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { message, departmentId } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  const { taskType } = isHeavyTask(message);
  const dept = routeMessage(message, departmentId);

  // ワーカーのオンライン状態を確認
  const { data: workerData } = await getSupabaseAdmin()
    .from('company_worker_status')
    .select('is_online, last_heartbeat')
    .eq('id', 'default')
    .single();

  const isWorkerOnline = workerData?.is_online &&
    workerData?.last_heartbeat &&
    Date.now() - new Date(workerData.last_heartbeat).getTime() < HEARTBEAT_TIMEOUT_MS;

  if (!isWorkerOnline) {
    return NextResponse.json({
      offline: true,
      message: '自宅PCがオフラインです。PCを起動してからもう一度お試しください。',
      departmentId: dept.id,
      departmentName: dept.name,
      person: dept.person,
    });
  }

  // Supabaseにタスク作成
  const { data: task, error } = await getSupabaseAdmin()
    .from('company_tasks')
    .insert({
      message,
      department_id: dept.id,
      department_name: dept.name,
      person: dept.person,
      task_type: taskType || 'heavy',
      priority: 0,
    })
    .select('id, status, created_at')
    .single();

  if (error) {
    console.error('Task creation error:', error.message);
    return NextResponse.json({ error: 'タスクの作成に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({
    taskId: task.id,
    status: task.status,
    departmentId: dept.id,
    departmentName: dept.name,
    person: dept.person,
    createdAt: task.created_at,
  });
}

export async function GET(req: NextRequest) {
  const auth = await getAuthSession();
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  const { data: tasks, error } = await getSupabaseAdmin()
    .from('company_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Task list error:', error.message);
    return NextResponse.json({ error: 'タスク一覧の取得に失敗しました' }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}
