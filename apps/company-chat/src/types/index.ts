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
  taskId?: string;
  imageUrl?: string;
  timestamp: number;
  streaming?: boolean;
  toolsRunning?: string[];
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

// --- Task Queue Types ---

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type TaskType = 'research' | 'slide' | 'code' | 'report' | 'file-op' | 'heavy';

export interface Task {
  id: string;
  status: TaskStatus;
  message: string;
  department_id: string | null;
  department_name: string | null;
  person: string | null;
  task_type: TaskType;
  priority: number;
  result: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  worker_id: string | null;
}

export interface WorkerStatus {
  id: string;
  is_online: boolean;
  last_heartbeat: string;
  hostname: string | null;
}
