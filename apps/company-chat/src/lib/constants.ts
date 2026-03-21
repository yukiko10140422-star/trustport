export const MODELS = {
  haiku: { id: 'claude-haiku-4-5-20251001', label: 'Haiku', desc: '高速・低コスト' },
  sonnet: { id: 'claude-sonnet-4-6-20250131', label: 'Sonnet', desc: 'バランス型' },
  opus: { id: 'claude-opus-4-6-20250115', label: 'Opus', desc: '最高性能' },
} as const;

export type ModelKey = keyof typeof MODELS;

export const TOOL_LABELS: Record<string, string> = {
  get_calendar_events: 'カレンダー確認中',
  create_calendar_event: '予定作成中',
  delete_calendar_event: '予定削除中',
  get_todos: 'TODO確認中',
  create_todo: 'TODO作成中',
  complete_todo: 'TODO更新中',
  search_company_docs: '社内資料検索中',
  get_company_doc_detail: '資料取得中',
  web_search: 'Web検索中',
};

export const DEPT_COLORS: Record<string, string> = {
  secretary: '#4CAF50',
  ceo: '#D32F2F',
  pm: '#1976D2',
  research: '#7B1FA2',
  marketing: '#C2185B',
  engineering: '#E65100',
  finance: '#5D4037',
  sales: '#00838F',
  creative: '#AD1457',
  hr: '#558B2F',
  legal: '#546E7A',
  logistics: '#F9A825',
  ebay: '#283593',
  apparel: '#8E24AA',
  dx: '#00897B',
};
