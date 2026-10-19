/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AIAccount,
  TaskCategory,
  UsageLog,
  PromptTemplate,
  AppSettings,
  AuthState,
} from './types';
import {
  loadAccounts,
  saveAccounts,
  loadCategories,
  saveCategories,
  loadPrompts,
  savePrompts,
  loadUsageLogs,
  saveUsageLogs,
  loadSettings,
  saveSettings,
} from './lib/storage';
import { ALLOWLISTED_EMAIL } from './lib/defaultData';
import { isPasswordSet } from './lib/crypto';
import { Header, ActiveTab } from './components/Header';
import { Navigation } from './components/Navigation';
import { AccountCard } from './components/AccountCard';
import { AccountModal } from './components/AccountModal';
import { LimitTimerModal } from './components/LimitTimerModal';
import { QuickLogModal } from './components/QuickLogModal';
import { CategoryModal } from './components/CategoryModal';
import { TaskRecommender } from './components/TaskRecommender';
import { PromptLibrary } from './components/PromptLibrary';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { UsageHistory } from './components/UsageHistory';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { LockScreen } from './components/LockScreen';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  Plus,
  FolderKanban,
  AlertCircle,
  Sparkles,
  Search,
} from 'lucide-react';

export default function App() {
  // State: Data Store
  const [accounts, setAccounts] = useState<AIAccount[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [settings, setSettings] = useState<AppSettings>(loadSettings());

  // State: Authentication & Lock
  const [authState, setAuthState] = useState<AuthState>(() => {
    const savedEmail = sessionStorage.getItem('alokasiai_session_user');
    return {
      isAuthenticated: !!savedEmail,
      isLocked: false,
      userEmail: savedEmail,
      lastActiveTime: Date.now(),
    };
  });

  // State: Active Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('accounts');

  // State: Filters for Account Map
  const [accountFilter, setAccountFilter] = useState<'all' | 'aktif' | 'limit' | 'archived'>('all');
  const [accountSearch, setAccountSearch] = useState('');

  // State: Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AIAccount | null>(null);

  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [limitAccount, setLimitAccount] = useState<AIAccount | null>(null);

  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
  const [logPrefillAccount, setLogPrefillAccount] = useState<AIAccount | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // State: Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Hydrate all data on mount
  const refreshData = useCallback(() => {
    setAccounts(loadAccounts());
    setCategories(loadCategories());
    setPrompts(loadPrompts());
    setUsageLogs(loadUsageLogs());
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Periodic check for expired account limits every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAccounts(loadAccounts());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Inactivity Auto-Lock Detector
  useEffect(() => {
    if (!authState.isAuthenticated || authState.isLocked) return;
    if (!settings.sessionTimeoutMinutes || settings.sessionTimeoutMinutes <= 0) return;

    const timeoutMs = settings.sessionTimeoutMinutes * 60 * 1000;

    const handleUserActivity = () => {
      setAuthState((prev) => ({ ...prev, lastActiveTime: Date.now() }));
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    const checkInterval = setInterval(() => {
      if (Date.now() - authState.lastActiveTime >= timeoutMs) {
        setAuthState((prev) => ({ ...prev, isLocked: true }));
      }
    }, 15000);

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      clearInterval(checkInterval);
    };
  }, [authState.isAuthenticated, authState.isLocked, authState.lastActiveTime, settings.sessionTimeoutMinutes]);

  // Auth Handlers
  const handleAuthSuccess = (email: string) => {
    sessionStorage.setItem('alokasiai_session_user', email);
    setAuthState({
      isAuthenticated: true,
      isLocked: false,
      userEmail: email,
      lastActiveTime: Date.now(),
    });
    refreshData();
    showToast(`Selamat datang di AlokasiAI, ${email}!`);
  };

  const handleUnlock = () => {
    setAuthState((prev) => ({
      ...prev,
      isLocked: false,
      lastActiveTime: Date.now(),
    }));
    showToast('Layar berhasil dibuka.');
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('alokasiai_session_user');
    setAuthState({
      isAuthenticated: false,
      isLocked: false,
      userEmail: null,
      lastActiveTime: Date.now(),
    });
  };

  const handleManualLock = () => {
    setAuthState((prev) => ({ ...prev, isLocked: true }));
  };

  // Account Operations
  const handleSaveAccount = (accData: Partial<AIAccount>) => {
    let updated: AIAccount[];
    if (accData.id) {
      // Edit
      updated = accounts.map((a) =>
        a.id === accData.id
          ? ({ ...a, ...accData, updatedAt: new Date().toISOString() } as AIAccount)
          : a
      );
      showToast('Perubahan akun berhasil disimpan.');
    } else {
      // New
      const newAcc: AIAccount = {
        id: `acc-${Date.now()}`,
        alias: accData.alias || 'Akun AI',
        email: accData.email,
        role: accData.role || 'Tugas Konten',
        plan: accData.plan || 'pro',
        status: accData.status || 'aktif',
        limitResetAt: null,
        notes: accData.notes || '',
        color: accData.color || 'indigo',
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      updated = [newAcc, ...accounts];
      showToast('Akun AI baru berhasil ditambahkan.');
    }
    setAccounts(updated);
    saveAccounts(updated);
  };

  const handleDeleteAccount = (accId: string) => {
    const updated = accounts.filter((a) => a.id !== accId);
    setAccounts(updated);
    saveAccounts(updated);
    setIsAccountModalOpen(false);
    showToast('Akun berhasil dihapus.');
  };

  const handleStatusChange = (accountId: string, newStatus: AIAccount['status'], limitResetAt?: string | null) => {
    const updated = accounts.map((a) => {
      if (a.id === accountId) {
        return {
          ...a,
          status: newStatus,
          limitResetAt: limitResetAt !== undefined ? limitResetAt : a.limitResetAt,
          updatedAt: new Date().toISOString(),
        };
      }
      return a;
    });
    setAccounts(updated);
    saveAccounts(updated);
    if (newStatus === 'aktif') {
      showToast('Status akun dipulihkan ke Aktif!');
    } else if (newStatus === 'istirahat') {
      showToast('Akun diistirahatkan sementara.');
    }
  };

  const handleToggleArchive = (accountId: string) => {
    const updated = accounts.map((a) => {
      if (a.id === accountId) {
        return { ...a, archived: !a.archived, updatedAt: new Date().toISOString() };
      }
      return a;
    });
    setAccounts(updated);
    saveAccounts(updated);
    showToast('Status arsip akun diperbarui.');
  };

  const handleConfirmLimit = (accountId: string, resetTime: string) => {
    handleStatusChange(accountId, 'limit', resetTime);
    showToast('Hitung mundur limit akun dimulai!');
  };

  // Usage Log Operations
  const handleSaveLog = (logData: Omit<UsageLog, 'id'>) => {
    const newLog: UsageLog = {
      ...logData,
      id: `log-${Date.now()}`,
    };
    const updated = [newLog, ...usageLogs];
    setUsageLogs(updated);
    saveUsageLogs(updated);
    showToast('Catatan pemakaian tugas berhasil disimpan!');
  };

  const handleDeleteLog = (logId: string) => {
    const updated = usageLogs.filter((l) => l.id !== logId);
    setUsageLogs(updated);
    saveUsageLogs(updated);
    showToast('Catatan pemakaian dihapus.');
  };

  // Prompt Operations
  const handleSavePrompt = (promptData: Partial<PromptTemplate>) => {
    let updated: PromptTemplate[];
    if (promptData.id) {
      updated = prompts.map((p) =>
        p.id === promptData.id ? ({ ...p, ...promptData } as PromptTemplate) : p
      );
      showToast('Template prompt diperbarui.');
    } else {
      const newPrompt: PromptTemplate = {
        id: `pr-${Date.now()}`,
        title: promptData.title || 'Prompt Baru',
        categoryId: promptData.categoryId || categories[0]?.id || 'cat-soal',
        targetAccountId: promptData.targetAccountId,
        content: promptData.content || '',
        tags: promptData.tags || [],
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      updated = [newPrompt, ...prompts];
      showToast('Prompt baru ditambahkan ke perpustakaan.');
    }
    setPrompts(updated);
    savePrompts(updated);
  };

  const handleDeletePrompt = (promptId: string) => {
    const updated = prompts.filter((p) => p.id !== promptId);
    setPrompts(updated);
    savePrompts(updated);
    showToast('Prompt berhasil dihapus.');
  };

  const handleIncrementPromptUsage = (promptId: string) => {
    const updated = prompts.map((p) =>
      p.id === promptId ? { ...p, usageCount: p.usageCount + 1 } : p
    );
    setPrompts(updated);
    savePrompts(updated);
  };

  // Category Operations
  const handleSaveCategory = (catData: Partial<TaskCategory>) => {
    const newCat: TaskCategory = {
      id: `cat-${Date.now()}`,
      name: catData.name || 'Kategori Baru',
      description: catData.description || '',
      color: catData.color || 'indigo',
      primaryAccountIds: catData.primaryAccountIds || [],
      isCustom: true,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    showToast('Kategori baru berhasil dibuat.');
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = categories.filter((c) => c.id !== catId);
    setCategories(updated);
    saveCategories(updated);
    showToast('Kategori kustom dihapus.');
  };

  // Settings Save
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    showToast('Pengaturan berhasil diperbarui.');
  };

  // Quick Log Trigger from Recommendation
  const handleSelectAccountFromRecommender = (
    account: AIAccount,
    taskTitle: string
  ) => {
    setLogPrefillAccount(account);
    setIsQuickLogModalOpen(true);
  };

  // Computed counts
  const activeAccountsCount = accounts.filter((a) => !a.archived && a.status === 'aktif').length;
  const limitedAccountsCount = accounts.filter((a) => !a.archived && a.status === 'limit').length;

  // Filtered accounts for Account Map
  const filteredAccounts = accounts.filter((acc) => {
    if (accountFilter === 'aktif' && (acc.archived || acc.status !== 'aktif')) return false;
    if (accountFilter === 'limit' && (acc.archived || acc.status !== 'limit')) return false;
    if (accountFilter === 'archived' && !acc.archived) return false;
    if (accountFilter === 'all' && acc.archived) return false;

    if (accountSearch.trim()) {
      const q = accountSearch.toLowerCase();
      const matchAlias = acc.alias.toLowerCase().includes(q);
      const matchRole = acc.role.toLowerCase().includes(q);
      const matchNotes = acc.notes.toLowerCase().includes(q);
      return matchAlias || matchRole || matchNotes;
    }
    return true;
  });

  // Render Gate: Not Authenticated
  if (!authState.isAuthenticated) {
    return <AuthScreen onSuccess={handleAuthSuccess} />;
  }

  // Render Gate: Locked Screen
  if (authState.isLocked) {
    return (
      <LockScreen
        userEmail={authState.userEmail || ALLOWLISTED_EMAIL}
        onUnlock={handleUnlock}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLockScreen={handleManualLock}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        activeAccountsCount={activeAccountsCount}
        limitedAccountsCount={limitedAccountsCount}
        userEmail={authState.userEmail}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12">
        {/* VIEW 1: PETA AKUN (ACCOUNT MAP) */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* Creator Overview Banner */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-sm">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Sistem Sebaran Beban Akun AI
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Peta Akun Claude Kedinasan & CPNS
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                  Pantau ketersediaan akun, status limit, peran pembuatan soal, naskah video, dan materi tryout dalam satu layar kendali.
                </p>

                {/* Status summary pill tags */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{activeAccountsCount} Akun Siap / Aktif</span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1.5 font-medium text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{limitedAccountsCount} Akun Limit (Hitung Mundur)</span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1.5 font-medium text-slate-400">
                    <span>{accounts.length} Total Akun Terdaftar</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => {
                    setEditingAccount(null);
                    setIsAccountModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Akun Baru</span>
                </button>

                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors min-h-[44px]"
                >
                  <FolderKanban className="w-4 h-4 text-cyan-400" />
                  <span>Kelola Kategori ({categories.length})</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: `Semua (${accounts.filter((a) => !a.archived).length})` },
                  { id: 'aktif', label: `Aktif (${activeAccountsCount})` },
                  { id: 'limit', label: `Kena Limit (${limitedAccountsCount})` },
                  { id: 'archived', label: `Arsip (${accounts.filter((a) => a.archived).length})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAccountFilter(f.id as typeof accountFilter)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      accountFilter === f.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder="Cari alias, peran, catatan..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Account Cards Grid */}
            {filteredAccounts.length === 0 ? (
              <div className="rounded-3xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-200">Tidak ada akun pada filter ini</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Coba ubah filter atau tambahkan akun Claude baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredAccounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onEdit={(acc) => {
                      setEditingAccount(acc);
                      setIsAccountModalOpen(true);
                    }}
                    onStatusChange={handleStatusChange}
                    onOpenLimitModal={(acc) => {
                      setLimitAccount(acc);
                      setIsLimitModalOpen(true);
                    }}
                    onQuickLog={(acc) => {
                      setLogPrefillAccount(acc);
                      setIsQuickLogModalOpen(true);
                    }}
                    onToggleArchive={handleToggleArchive}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: REKOMENDASI TUGAS CERDAS */}
        {activeTab === 'recommender' && (
          <TaskRecommender
            accounts={accounts.filter((a) => !a.archived)}
            categories={categories}
            usageLogs={usageLogs}
            prompts={prompts}
            onSelectAccountToLog={handleSelectAccountFromRecommender}
          />
        )}

        {/* VIEW 3: CATAT PEMAKAIAN / RIWAYAT */}
        {activeTab === 'logs' && (
          <UsageHistory
            logs={usageLogs}
            accounts={accounts}
            categories={categories}
            onDeleteLog={handleDeleteLog}
            onOpenQuickLog={() => {
              setLogPrefillAccount(null);
              setIsQuickLogModalOpen(true);
            }}
          />
        )}

        {/* VIEW 4: DASHBOARD SEBARAN BEBAN */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            accounts={accounts.filter((a) => !a.archived)}
            categories={categories}
            usageLogs={usageLogs}
          />
        )}

        {/* VIEW 5: PERPUSTAKAAN PROMPT */}
        {activeTab === 'prompts' && (
          <PromptLibrary
            prompts={prompts}
            categories={categories}
            accounts={accounts.filter((a) => !a.archived)}
            onSavePrompt={handleSavePrompt}
            onDeletePrompt={handleDeletePrompt}
            onIncrementUsage={handleIncrementPromptUsage}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        limitedAccountsCount={limitedAccountsCount}
      />

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 bg-slate-900 border border-indigo-500/40 text-slate-100 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals Container */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        initialAccount={editingAccount}
      />

      {limitAccount && (
        <LimitTimerModal
          account={limitAccount}
          isOpen={isLimitModalOpen}
          onClose={() => setIsLimitModalOpen(false)}
          onConfirmLimit={handleConfirmLimit}
        />
      )}

      <QuickLogModal
        isOpen={isQuickLogModalOpen}
        onClose={() => setIsQuickLogModalOpen(false)}
        onSaveLog={handleSaveLog}
        accounts={accounts.filter((a) => !a.archived)}
        categories={categories}
        preselectedAccount={logPrefillAccount}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        accounts={accounts.filter((a) => !a.archived)}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onDataRestored={refreshData}
        userEmail={authState.userEmail}
      />
    </div>
  );
}
