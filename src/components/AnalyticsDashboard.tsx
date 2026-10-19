import React, { useState } from 'react';
import { AIAccount, TaskCategory, UsageLog } from '../types';
import { BarChart3, TrendingUp, AlertCircle, CheckCircle, PieChart, Layers } from 'lucide-react';

interface AnalyticsDashboardProps {
  accounts: AIAccount[];
  categories: TaskCategory[];
  usageLogs: UsageLog[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  accounts,
  categories,
  usageLogs,
}) => {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Filter logs by timeframe
  const now = Date.now();
  const filteredLogs = usageLogs.filter((log) => {
    const logTime = new Date(log.timestamp).getTime();
    if (timeframe === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return logTime >= todayStart.getTime();
    }
    if (timeframe === 'week') {
      return logTime >= now - 7 * 86400000;
    }
    if (timeframe === 'month') {
      return logTime >= now - 30 * 86400000;
    }
    return true;
  });

  // Calculate load points per account
  const accountStats = accounts.map((acc) => {
    const logs = filteredLogs.filter((l) => l.accountId === acc.id);
    const totalPoints = logs.reduce((sum, l) => {
      const weight = l.load === 'berat' ? 4 : l.load === 'sedang' ? 2 : 1;
      return sum + weight;
    }, 0);
    return {
      account: acc,
      taskCount: logs.length,
      loadPoints: totalPoints,
    };
  });

  // Sort by load points to find busiest and most relaxed
  const sortedByLoad = [...accountStats].sort((a, b) => b.loadPoints - a.loadPoints);
  const busiestAccount = sortedByLoad.length > 0 ? sortedByLoad[0] : null;
  const idleAccount = sortedByLoad.length > 0 ? sortedByLoad[sortedByLoad.length - 1] : null;

  // Calculate distribution by category
  const categoryStats = categories.map((cat) => {
    const logs = filteredLogs.filter((l) => l.categoryId === cat.id);
    return {
      category: cat,
      count: logs.length,
    };
  });

  // Calculate load distribution (ringan vs sedang vs berat)
  const loadCounts = {
    ringan: filteredLogs.filter((l) => l.load === 'ringan').length,
    sedang: filteredLogs.filter((l) => l.load === 'sedang').length,
    berat: filteredLogs.filter((l) => l.load === 'berat').length,
  };

  const totalTasks = filteredLogs.length;
  const totalLoadPoints = accountStats.reduce((sum, a) => sum + a.loadPoints, 0);

  const maxAccountPoints = Math.max(...accountStats.map((a) => a.loadPoints), 1);
  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);

  return (
    <div className="space-y-6">
      {/* Header & Timeframe selector */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <BarChart3 className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">Dashboard Sebaran Beban Akun AI</h2>
          </div>
          <p className="text-xs text-slate-400">
            Analisis rotasi pemakaian agar tidak ada satu akun Claude yang overdosis pertanyaan sementara akun lain menganggur.
          </p>
        </div>

        {/* Timeframe segmented control */}
        <div className="flex items-center p-1 bg-slate-800 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'week', label: '7 Hari' },
            { id: 'month', label: '30 Hari' },
            { id: 'all', label: 'Semua' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id as typeof timeframe)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                timeframe === t.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Tugas Selesai</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-mono tabular-nums">
            {totalTasks}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Dalam rentang waktu aktif</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Poin Beban Kerja</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 mt-2 font-mono tabular-nums">
            {totalLoadPoints}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Bobot pertanyaan Claude</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Akun Paling Padat
          </p>
          <p className="text-sm sm:text-base font-bold text-white mt-2 truncate">
            {busiestAccount ? busiestAccount.account.alias.split('-')[0].trim() : '-'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
            {busiestAccount ? `${busiestAccount.loadPoints} poin (${busiestAccount.taskCount} tugas)` : '-'}
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Akun Paling Longgar
          </p>
          <p className="text-sm sm:text-base font-bold text-white mt-2 truncate">
            {idleAccount ? idleAccount.account.alias.split('-')[0].trim() : '-'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
            {idleAccount ? `${idleAccount.loadPoints} poin (Siap tugas baru)` : '-'}
          </p>
        </div>
      </div>

      {/* Main Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Load Progress Tracks */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Beban Kerja Per Akun AI</h3>
            </div>
            <span className="text-xs text-slate-400">Poin Beban</span>
          </div>

          <div className="space-y-4">
            {accountStats.map((item) => {
              const percentage = Math.round((item.loadPoints / maxAccountPoints) * 100);
              return (
                <div key={item.account.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-2">
                      {item.account.alias}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400 shrink-0">
                      {item.loadPoints} poin ({item.taskCount} tugas)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.account.status === 'limit'
                          ? 'bg-rose-500'
                          : item.loadPoints >= 10
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Frekuensi Per Kategori Konten</h3>
            </div>
            <span className="text-xs text-slate-400">Jumlah Tugas</span>
          </div>

          <div className="space-y-4">
            {categoryStats.map((cat) => {
              const percentage = totalTasks > 0 ? Math.round((cat.count / totalTasks) * 100) : 0;
              return (
                <div key={cat.category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate pr-2">
                      {cat.category.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400 shrink-0">
                      {cat.count} tugas ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, totalTasks > 0 && cat.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Intensity Proportion (Ringan / Sedang / Berat) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Distribusi Intensitas Beban Tugas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-400">Ringan (1 Poin)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Pertanyaan cepat / cek data</p>
            </div>
            <span className="text-lg font-mono font-extrabold text-white tabular-nums">
              {loadCounts.ringan}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-amber-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-400">Sedang (2 Poin)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">15-25 butir soal / video</p>
            </div>
            <span className="text-lg font-mono font-extrabold text-white tabular-nums">
              {loadCounts.sedang}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-rose-500/30 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-400">Berat (4 Poin)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Tryout 50+ soal HOTS</p>
            </div>
            <span className="text-lg font-mono font-extrabold text-white tabular-nums">
              {loadCounts.berat}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
