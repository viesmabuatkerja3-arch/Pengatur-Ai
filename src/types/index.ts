export type AccountPlan = 'free' | 'pro' | 'team' | 'enterprise';
export type AccountStatus = 'aktif' | 'limit' | 'istirahat';
export type TaskLoad = 'ringan' | 'sedang' | 'berat';

export interface AIAccount {
  id: string;
  alias: string;
  email?: string;
  role: string;
  plan: AccountPlan;
  status: AccountStatus;
  limitResetAt: string | null; // ISO timestamp
  notes: string;
  color: string; // e.g., 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'purple'
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  primaryAccountIds: string[];
  isCustom?: boolean;
}

export interface UsageLog {
  id: string;
  accountId: string;
  categoryId: string;
  load: TaskLoad;
  taskTitle: string;
  note: string;
  timestamp: string; // ISO timestamp
}

export interface PromptTemplate {
  id: string;
  title: string;
  categoryId: string;
  targetAccountId?: string; // Optional: specific account or all
  content: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
}

export interface AppSettings {
  sessionTimeoutMinutes: number; // 0 = never, 5, 15, 30, 60
  allowlistedEmail: string;
  theme: 'dark' | 'light';
  lastBackupDate: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  userEmail: string | null;
  lastActiveTime: number;
}
