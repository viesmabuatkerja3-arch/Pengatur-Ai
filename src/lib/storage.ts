import { AIAccount, TaskCategory, PromptTemplate, UsageLog, AppSettings } from '../types';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_CATEGORIES,
  DEFAULT_PROMPTS,
  DEFAULT_USAGE_LOGS,
  DEFAULT_SETTINGS,
} from './defaultData';

const STORAGE_KEYS = {
  ACCOUNTS: 'alokasiai_accounts_v1',
  CATEGORIES: 'alokasiai_categories_v1',
  PROMPTS: 'alokasiai_prompts_v1',
  USAGE_LOGS: 'alokasiai_usage_logs_v1',
  SETTINGS: 'alokasiai_settings_v1',
};

// Safe JSON parser
function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key "${key}" from localStorage:`, err);
    return fallback;
  }
}

// Data store accessors
export function loadAccounts(): AIAccount[] {
  const accounts = safeParse<AIAccount[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  // Auto-check expired limits
  const now = Date.now();
  let modified = false;
  const updated = accounts.map(acc => {
    if (acc.status === 'limit' && acc.limitResetAt) {
      const resetTime = new Date(acc.limitResetAt).getTime();
      if (now >= resetTime) {
        modified = true;
        return {
          ...acc,
          status: 'aktif' as const,
          limitResetAt: null,
          updatedAt: new Date().toISOString(),
        };
      }
    }
    return acc;
  });
  if (modified) {
    saveAccounts(updated);
  }
  return updated;
}

export function saveAccounts(accounts: AIAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
}

export function loadCategories(): TaskCategory[] {
  return safeParse<TaskCategory[]>(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
}

export function saveCategories(categories: TaskCategory[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function loadPrompts(): PromptTemplate[] {
  return safeParse<PromptTemplate[]>(STORAGE_KEYS.PROMPTS, DEFAULT_PROMPTS);
}

export function savePrompts(prompts: PromptTemplate[]): void {
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
}

export function loadUsageLogs(): UsageLog[] {
  return safeParse<UsageLog[]>(STORAGE_KEYS.USAGE_LOGS, DEFAULT_USAGE_LOGS);
}

export function saveUsageLogs(logs: UsageLog[]): void {
  localStorage.setItem(STORAGE_KEYS.USAGE_LOGS, JSON.stringify(logs));
}

export function loadSettings(): AppSettings {
  return safeParse<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// Backup & Export Functions
export function exportAllDataAsJSON(): string {
  const backup = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    app: 'AlokasiAI',
    accounts: loadAccounts(),
    categories: loadCategories(),
    prompts: loadPrompts(),
    usageLogs: loadUsageLogs(),
    settings: loadSettings(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importAllDataFromJSON(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data || !Array.isArray(data.accounts) || !Array.isArray(data.categories)) {
      return { success: false, message: 'Format data JSON tidak valid. Pastikan file cadangan berasal dari AlokasiAI.' };
    }
    if (data.accounts) saveAccounts(data.accounts);
    if (data.categories) saveCategories(data.categories);
    if (data.prompts) savePrompts(data.prompts);
    if (data.usageLogs) saveUsageLogs(data.usageLogs);
    if (data.settings) {
      const current = loadSettings();
      saveSettings({ ...current, ...data.settings, lastBackupDate: new Date().toISOString() });
    }
    return { success: true, message: 'Data cadangan berhasil dipulihkan secara lengkap!' };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Kesalahan parsing JSON';
    return { success: false, message: `Gagal memulihkan cadangan: ${errorMessage}` };
  }
}

export function exportUsageLogsAsCSV(): string {
  const logs = loadUsageLogs();
  const accounts = loadAccounts();
  const categories = loadCategories();

  const accMap = new Map(accounts.map(a => [a.id, a.alias]));
  const catMap = new Map(categories.map(c => [c.id, c.name]));

  const headers = ['ID', 'Waktu', 'Nama Akun', 'Kategori', 'Beban Kerja', 'Judul Tugas', 'Catatan'];
  const rows = logs.map(log => {
    return [
      log.id,
      new Date(log.timestamp).toLocaleString('id-ID'),
      `"${(accMap.get(log.accountId) || log.accountId).replace(/"/g, '""')}"`,
      `"${(catMap.get(log.categoryId) || log.categoryId).replace(/"/g, '""')}"`,
      log.load.toUpperCase(),
      `"${(log.taskTitle || '').replace(/"/g, '""')}"`,
      `"${(log.note || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function resetAllDataToDefault(): void {
  saveAccounts(DEFAULT_ACCOUNTS);
  saveCategories(DEFAULT_CATEGORIES);
  savePrompts(DEFAULT_PROMPTS);
  saveUsageLogs(DEFAULT_USAGE_LOGS);
  saveSettings(DEFAULT_SETTINGS);
}
