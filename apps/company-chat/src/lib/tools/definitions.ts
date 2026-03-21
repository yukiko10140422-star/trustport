import type Anthropic from '@anthropic-ai/sdk';

export const TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_calendar_events',
    description: 'ユーザーのGoogleカレンダーからイベントを取得します。「今月の予定」「来週の予定」「今日の予定」などを聞かれたときに使います。',
    input_schema: {
      type: 'object' as const,
      properties: {
        timeMin: {
          type: 'string',
          description: '取得開始日時（ISO8601形式）。例: 2026-03-01T00:00:00+09:00',
        },
        timeMax: {
          type: 'string',
          description: '取得終了日時（ISO8601形式）。例: 2026-03-31T23:59:59+09:00',
        },
      },
      required: ['timeMin', 'timeMax'],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Googleカレンダーに新しい予定を追加します。「会議を入れて」「予定を追加して」などのときに使います。',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: '予定のタイトル' },
        start: { type: 'string', description: '開始日時（ISO8601形式）。終日の場合はYYYY-MM-DD' },
        end: { type: 'string', description: '終了日時（ISO8601形式）。省略時は開始から1時間後' },
        allDay: { type: 'boolean', description: '終日イベントの場合true' },
      },
      required: ['title', 'start'],
    },
  },
  {
    name: 'get_todos',
    description: 'Google TasksからTODOリストを取得します。「TODO一覧」「やることリスト」などを聞かれたときに使います。',
    input_schema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'create_todo',
    description: 'Google Tasksに新しいTODOを追加します。「TODOに追加して」「やることリストに入れて」などのときに使います。',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'TODOのタイトル' },
        due: { type: 'string', description: '期限日（YYYY-MM-DD形式）。省略可' },
        notes: { type: 'string', description: 'メモ。省略可' },
      },
      required: ['title'],
    },
  },
  {
    name: 'complete_todo',
    description: 'TODOの完了/未完了を切り替えます。「○○を完了にして」「TODOを終わらせて」などのときに使います。',
    input_schema: {
      type: 'object' as const,
      properties: {
        taskId: { type: 'string', description: 'タスクのID' },
        completed: { type: 'boolean', description: '完了にする場合true、未完了に戻す場合false' },
      },
      required: ['taskId', 'completed'],
    },
  },
];
