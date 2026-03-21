import type { ChatMessage } from '@/types';

export function genId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function createSecretaryMessage(content: string): ChatMessage {
  return {
    id: genId(),
    role: 'assistant',
    content,
    departmentId: 'secretary',
    departmentName: '秘書室',
    person: '藤崎 ひなた',
    timestamp: Date.now(),
  };
}

export const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'おはようございます！秘書のひなたです。\n何でも聞いてくださいね。',
  departmentId: 'secretary',
  departmentName: '秘書室',
  person: '藤崎 ひなた',
  timestamp: Date.now(),
};
