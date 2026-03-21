export interface Department {
  id: string;
  name: string;
  person: string;
  role: string;
  group: string;
  personality: string;
  tone: string;
  catchphrases: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  departmentId?: string;
  departmentName?: string;
  person?: string;
  model?: string;
  timestamp: number;
}

export interface ChatRequest {
  message: string;
  model: 'haiku' | 'sonnet' | 'opus';
  history: { role: 'user' | 'assistant'; content: string }[];
  departmentId?: string;
}

export interface RoutingResult {
  departments: Department[];
  primary: Department;
}
