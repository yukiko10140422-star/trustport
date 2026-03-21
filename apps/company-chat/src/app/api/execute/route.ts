import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { spawn } from 'child_process';
import { authOptions } from '@/lib/auth';
import { routeMessage } from '@/lib/router';
import { DEPARTMENTS } from '@/lib/departments';

export const maxDuration = 120;

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

  const dept = routeMessage(message, departmentId);
  const deptInfo = DEPARTMENTS[dept.id];

  const prompt = [
    `あなたは「${dept.name}」部署の${dept.person}として行動してください。`,
    `口調: ${deptInfo?.tone || '丁寧'}`,
    ``,
    `オーナーからの依頼:`,
    message,
    ``,
    `指示:`,
    `- 上記の依頼を実行してください`,
    `- 作業対象のディレクトリは .company/ 配下です`,
    `- 完了後、何をしたか簡潔に報告してください`,
  ].join('\n');

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const meta = JSON.stringify({
        type: 'meta',
        departmentId: dept.id,
        departmentName: dept.name,
        person: dept.person,
        model: 'claude-code',
        routingMessage: `${dept.name}の${dept.person}さんに作業を依頼しますね！（Claude Code 実行中...）`,
      });
      controller.enqueue(encoder.encode(`data: ${meta}\n\n`));

      const cwd = process.cwd().replace(/[/\\]apps[/\\]company-chat$/, '');

      const child = spawn('claude', ['-p', prompt, '--output-format', 'text'], {
        cwd,
        shell: true,
        env: { ...process.env, CLAUDE_CODE_ENTRYPOINT: 'api' },
      });

      let output = '';

      child.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
      });

      child.stderr.on('data', (data: Buffer) => {
        // ignore stderr
      });

      child.on('close', (code: number) => {
        const result = output.trim() || `(Claude Code 終了コード: ${code})`;
        const chunk = JSON.stringify({ type: 'result', content: result });
        controller.enqueue(encoder.encode(`data: ${chunk}\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
        controller.close();
      });

      child.on('error', (err: Error) => {
        const errChunk = JSON.stringify({
          type: 'result',
          content: `Claude Code の実行に失敗しました: ${err.message}\n\nヒント: claude CLI がインストールされているか確認してください。`,
        });
        controller.enqueue(encoder.encode(`data: ${errChunk}\n\n`));
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
