import React from 'react';
import { Lock, Settings, LayoutGrid, ClipboardList, BarChart3, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'accounts' | 'logs' | 'analytics' | 'recommender' | 'prompts';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLockScreen: () => void;
  onOpenSettings: () => void;
  activeAccountsCount: number;
  limitedAccountsCount: number;
  userEmail?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onLockScreen,
  onOpenSettings,
  activeAccountsCount,
  limitedAccountsCount,
  userEmail,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 p-0.5 flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-tr from-indigo-400 to-cyan-400">
                AI
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold text-white tracking-tight whitespace-nowrap">
              AlokasiAI
            </span>
            <span className="text-[10px] text-slate-400 -mt-0.5 hidden sm:inline whitespace-nowrap">
              Kedinasan & CPNS
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => onTabChange('accounts')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'accounts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
            <span>Peta Akun</span>
            {limitedAccountsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {limitedAccountsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('recommender')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'recommender'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Rekomendasi</span>
          </button>

          <button
            onClick={() => onTabChange('logs')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 shrink-0" />
            <span>Catat Tugas</span>
          </button>

          <button
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onTabChange('prompts')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'prompts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Prompt</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Lock, Settings, PWA) */}
        <div className="flex items-center gap-2 shrink-0">
          {userEmail && (
            <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[140px] text-slate-300 font-mono">{userEmail}</span>
            </div>
          )}

          <PWAInstallButton />

          <button
            onClick={onLockScreen}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors min-h-[40px]"
            title="Kunci layar aplikasi"
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="hidden sm:inline">Kunci</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors min-h-[40px]"
            title="Buka Pengaturan & Cadangan"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden sm:inline">Setelan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
