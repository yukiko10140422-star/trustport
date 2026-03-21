import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { routeMessage } from '@/lib/router';
import { classifyTask } from '@/lib/action-detector';

const HEARTBEAT_TIMEOUT_MS = 60_000; // 60秒以内のハートビートならオンライン

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { message, departmentId } = body;

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  // タスク分類
  const classification = classifyTask(message);
  const dept = routeMessage(message, departmentId);

  // ワーカーのオンライン状態を確認
  const { data: workerData } = await supabaseAdmin
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
  const { data: task, error } = await supabaseAdmin
    .from('company_tasks')
    .insert({
      message,
      department_id: dept.id,
      department_name: dept.name,
      person: dept.person,
      task_type: classification.taskType || 'heavy',
      priority: 0,
    })
    .select('id, status, created_at')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 50);

  const { data: tasks, error } = await supabaseAdmin
    .from('company_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks });
}
