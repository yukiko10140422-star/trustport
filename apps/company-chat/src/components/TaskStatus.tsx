'use client';

import { useTaskSubscription } from '@/hooks/useTaskSubscription';

interface TaskStatusProps {
  taskId: string;
  onComplete?: (result: string) => void;
}

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: '処理待ち...', color: '#F9A825' },
  running: { text: '処理中...', color: '#1976D2' },
  completed: { text: '完了', color: '#4CAF50' },
  failed: { text: 'エラー', color: '#D32F2F' },
  cancelled: { text: 'キャンセル', color: '#9E9E9E' },
};

export default function TaskStatus({ taskId, onComplete }: TaskStatusProps) {
  const { task, isLoading } = useTaskSubscription(taskId);

  // 完了時にコールバック
  if (task?.status === 'completed' && task.result && onComplete) {
    onComplete(task.result);
  }

  if (isLoading || !task) {
    return (
      <div style={containerStyle}>
        <Spinner /> タスクを送信中...
      </div>
    );
  }

  const label = STATUS_LABELS[task.status] || STATUS_LABELS.pending;

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {task.status === 'running' || task.status === 'pending' ? (
          <Spinner />
        ) : (
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: label.color, display: 'inline-block',
          }} />
        )}
        <span style={{ fontSize: 13, color: label.color, fontWeight: 600 }}>
          {label.text}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          ID: {taskId.slice(0, 8)}
        </span>
      </div>

      {task.status === 'completed' && task.result && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: 'var(--bg)', fontSize: 14, lineHeight: 1.5,
          whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto',
        }}>
          {task.result}
        </div>
      )}

      {task.status === 'failed' && task.error && (
        <div style={{
          marginTop: 8, padding: '8px 12px', borderRadius: 8,
          background: '#FFF3F0', fontSize: 13, color: '#D32F2F',
        }}>
          {task.error}
        </div>
      )}

      {(task.status === 'pending' || task.status === 'running') && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
          自宅PCで処理しています。完了次第ここに結果が表示されます。
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 14, height: 14,
      border: '2px solid var(--border)', borderTopColor: 'var(--primary)',
      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
    }} />
  );
}

const containerStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 12,
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  marginTop: 4,
};
