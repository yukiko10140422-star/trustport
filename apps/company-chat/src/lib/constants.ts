export const MODELS = {
  haiku: { id: 'claude-haiku-4-5-20251001', label: 'Haiku', desc: '高速・低コスト' },
  sonnet: { id: 'claude-sonnet-4-6-20250131', label: 'Sonnet', desc: 'バランス型' },
  opus: { id: 'claude-opus-4-6-20250115', label: 'Opus', desc: '最高性能' },
} as const;

export type ModelKey = keyof typeof MODELS;

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
