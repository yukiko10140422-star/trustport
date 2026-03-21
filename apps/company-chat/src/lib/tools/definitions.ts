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
    name: 'delete_calendar_event',
    description: 'Googleカレンダーの予定を削除します。「予定を消して」「キャンセルして」などのときに使います。まずget_calendar_eventsで対象のイベントIDを確認してから削除してください。',
    input_schema: {
      type: 'object' as const,
      properties: {
        eventId: { type: 'string', description: '削除するイベントのID（get_calendar_eventsの結果から取得）' },
      },
      required: ['eventId'],
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
  {
    name: 'search_company_docs',
    description: '社内資料を全文検索します。事業の進捗、決定事項、リサーチ結果、プロジェクト計画などを調べるときに使います。キーワードで検索し、関連するドキュメントの内容を返します。',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '検索キーワード（スペース区切りでAND検索）。例: "アパレル 進捗", "DX ターゲット"',
        },
        department: {
          type: 'string',
          description: '部署で絞り込む場合に指定。例: "apparel", "ceo", "research", "pm", "dx"',
        },
        doc_type: {
          type: 'string',
          description: 'ドキュメント種別で絞り込む。例: "decision", "project", "research", "todo"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_company_doc_detail',
    description: '特定の社内資料の全文を取得します。search_company_docsで見つかったドキュメントの詳細を確認したいときに使います。',
    input_schema: {
      type: 'object' as const,
      properties: {
        file_path: {
          type: 'string',
          description: 'ドキュメントのfile_path。search_company_docsの結果から取得したパスを指定。',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'web_search',
    description: 'インターネットで最新情報を検索します。ニュース、技術トレンド、市場動向、価格、人物情報など、外部の最新情報が必要なときに使います。検索結果のURLを引用元として必ず提示してください。',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: '検索クエリ。具体的なキーワードで検索してください。',
        },
        count: {
          type: 'number',
          description: '取得する検索結果の件数（デフォルト: 5、最大: 10）',
        },
      },
      required: ['query'],
    },
  },
];
