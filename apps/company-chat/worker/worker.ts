import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { Heartbeat } from './heartbeat.js';

// --- 設定 ---

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const POLL_INTERVAL = parseInt(process.env.WORKER_POLL_INTERVAL || '5000', 10);
const TASK_TIMEOUT = parseInt(process.env.WORKER_TASK_TIMEOUT || '300000', 10); // 5分
const WORKER_ID = process.env.WORKER_ID || 'home-pc';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('環境変数 SUPABASE_URL / SUPABASE_KEY が未設定です');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const heartbeat = new Heartbeat();

// プロジェクトルート（worker/ の2つ上）
const PROJECT_ROOT = resolve(import.meta.dirname, '..', '..', '..');

let isRunning = false;
let shuttingDown = false;

// --- メインループ ---

async function pollAndExecute(): Promise<void> {
  if (isRunning || shuttingDown) return;

  // orphanedタスクの回収（5分以上runningのまま）
  await recoverOrphanedTasks();

  // pendingタスクを1件取得
  const { data: task, error } = await supabase
    .from('company_tasks')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !task) return; // タスクなし

  // 楽観ロック: pending → running に更新（他ワーカーとの競合防止）
  const { error: lockError } = await supabase
    .from('company_tasks')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
      worker_id: WORKER_ID,
    })
    .eq('id', task.id)
    .eq('status', 'pending');

  if (lockError) return; // 別ワーカーが先に取った

  isRunning = true;
  console.log(`[TASK] ${task.id.slice(0, 8)} 開始: ${task.message.slice(0, 50)}...`);

  try {
    const result = await executeWithClaude(task.message, task.department_id, task.department_name, task.person);

    await supabase
      .from('company_tasks')
      .update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    console.log(`[TASK] ${task.id.slice(0, 8)} 完了`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);

    await supabase
      .from('company_tasks')
      .update({
        status: 'failed',
        error: errorMsg,
        completed_at: new Date().toISOString(),
      })
      .eq('id', task.id);

    console.error(`[TASK] ${task.id.slice(0, 8)} 失敗:`, errorMsg);
  } finally {
    isRunning = false;
  }
}

// --- Claude CLI 実行 ---

function executeWithClaude(
  message: string,
  deptId: string | null,
  deptName: string | null,
  person: string | null,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const prompt = [
      deptName && person
        ? `あなたは「${deptName}」部署の${person}として行動してください。`
        : '',
      `オーナーからの依頼:`,
      message,
      ``,
      `指示:`,
      `- 上記の依頼を実行してください`,
      `- 作業対象のディレクトリは .company/ 配下です`,
      `- 完了後、何をしたか簡潔に報告してください`,
    ].filter(Boolean).join('\n');

    const child = spawn('claude', ['-p', prompt, '--output-format', 'text'], {
      cwd: PROJECT_ROOT,
      shell: true,
      env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: 'worker' },
    });

    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`タイムアウト（${TASK_TIMEOUT / 1000}秒）`));
    }, TASK_TIMEOUT);

    child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0 || stdout.trim()) {
        resolve(stdout.trim() || '(出力なし)');
      } else {
        reject(new Error(stderr.trim() || `Claude Code 終了コード: ${code}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// --- Orphanedタスク回収 ---

async function recoverOrphanedTasks(): Promise<void> {
  const fiveMinAgo = new Date(Date.now() - TASK_TIMEOUT).toISOString();

  const { data: orphaned } = await supabase
    .from('company_tasks')
    .select('id')
    .eq('status', 'running')
    .lt('started_at', fiveMinAgo);

  if (orphaned && orphaned.length > 0) {
    for (const task of orphaned) {
      await supabase
        .from('company_tasks')
        .update({
          status: 'failed',
          error: 'ワーカータイムアウト（orphaned task recovery）',
          completed_at: new Date().toISOString(),
        })
        .eq('id', task.id);

      console.log(`[RECOVER] orphaned task ${task.id.slice(0, 8)} を failed に変更`);
    }
  }
}

// --- グレースフルシャットダウン ---

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[WORKER] ${signal} 受信、シャットダウン中...`);
  shuttingDown = true;

  // 実行中タスクの完了を待つ（最大30秒）
  const deadline = Date.now() + 30_000;
  while (isRunning && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1000));
  }

  await heartbeat.stop(supabase);
  console.log('[WORKER] 停止完了');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// --- 起動 ---

async function main(): Promise<void> {
  console.log('[WORKER] Company Chat Worker 起動');
  console.log(`[WORKER] プロジェクトルート: ${PROJECT_ROOT}`);
  console.log(`[WORKER] ポーリング間隔: ${POLL_INTERVAL}ms`);
  console.log(`[WORKER] タスクタイムアウト: ${TASK_TIMEOUT}ms`);

  await heartbeat.start(supabase);
  console.log('[WORKER] ハートビート開始（30秒間隔）');

  // orphanedタスクの初回回収
  await recoverOrphanedTasks();

  // ポーリングループ
  setInterval(pollAndExecute, POLL_INTERVAL);
  console.log('[WORKER] タスク監視開始...\n');
}

main().catch((err) => {
  console.error('[WORKER] 起動失敗:', err);
  process.exit(1);
});
