import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { routeMessage } from '@/lib/router';
import { classifyTask } from '@/lib/action-detector';

const HEARTBEAT_TIMEOUT_MS = 60_000;

/**
 * /api/execute — 重作業をSupabaseタスクキューに登録
 * 旧実装の spawn('claude', ...) を置き換え
 */
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

  const classification = classifyTask(message);
  const dept = routeMessage(message, departmentId);

  // ワーカーのオンライン確認
  const { data: workerData } = await supabaseAdmin
    .from('company_worker_status')
    .select('is_online, last_heartbeat')
    .eq('id', 'default')
    .single();

  const isWorkerOnline = workerData?.is_online &&
    workerData?.last_heartbeat &&
    Date.now() - new Date(workerData.last_heartbeat).getTime() < HEARTBEAT_TIMEOUT_MS;

  // SSE互換レスポンス（既存フロントとの後方互換）
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const meta = JSON.stringify({
        type: 'meta',
        departmentId: dept.id,
        departmentName: dept.name,
        person: dept.person,
        model: 'task-queue',
        routingMessage: isWorkerOnline
          ? `${dept.name}の${dept.person}さんに作業を依頼しますね！（自宅PCで処理中...）`
          : `${dept.name}の${dept.person}さんに依頼したいのですが、自宅PCがオフラインです。PCを起動してからもう一度お試しください。`,
      });
      controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

      if (!isWorkerOnline) {
        const result = JSON.stringify({
          type: 'result',
          content: '自宅PCがオフラインのため、重作業を実行できません。\n\nPCを起動して worker を開始してください:\n```\ncd apps/company-chat/worker && npm start\n```',
        });
        controller.enqueue(encoder.encode(`data: ${result}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
        return;
      }

      // タスクをSupabaseに登録
      supabaseAdmin
        .from('company_tasks')
        .insert({
          message,
          department_id: dept.id,
          department_name: dept.name,
          person: dept.person,
          task_type: classification.taskType || 'heavy',
          priority: 0,
        })
        .select('id')
        .single()
        .then(({ data: task, error }) => {
          if (error || !task) {
            const errResult = JSON.stringify({
              type: 'result',
              content: `タスク登録に失敗しました: ${error?.message || 'Unknown error'}`,
            });
            controller.enqueue(encoder.encode(`data: ${errResult}\n\n`));
          } else {
            const result = JSON.stringify({
              type: 'result',
              content: `タスクを登録しました (ID: ${task.id.slice(0, 8)}...)。\n自宅PCで処理が完了次第、結果が表示されます。`,
              taskId: task.id,
            });
            controller.enqueue(encoder.encode(`data: ${result}\n\n`));
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          controller.close();
        });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
