import React, { useState } from 'react';
import { UsageLog, AIAccount, TaskCategory } from '../types';
import { History, Download, Trash2, Calendar, Filter, Plus } from 'lucide-react';
import { exportUsageLogsAsCSV, downloadFile } from '../lib/storage';

interface UsageHistoryProps {
  logs: UsageLog[];
  accounts: AIAccount[];
  categories: TaskCategory[];
  onDeleteLog: (logId: string) => void;
  onOpenQuickLog: () => void;
}

export const UsageHistory: React.FC<UsageHistoryProps> = ({
  logs,
  accounts,
  categories,
  onDeleteLog,
  onOpenQuickLog,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedLoad, setSelectedLoad] = useState<string>('all');

  const accMap = new Map(accounts.map((a) => [a.id, a.alias]));
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const filteredLogs = logs.filter((log) => {
    const matchAcc = selectedAccountId === 'all' || log.accountId === selectedAccountId;
    const matchCat = selectedCategoryId === 'all' || log.categoryId === selectedCategoryId;
    const matchLoad = selectedLoad === 'all' || log.load === selectedLoad;
    return matchAcc && matchCat && matchLoad;
  });

  const handleExportCSV = () => {
    const csvContent = exportUsageLogsAsCSV();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csvContent, `riwayat_pemakaian_alokasiai_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  };

  const getLoadBadge = (load: UsageLog['load']) => {
    switch (load) {
      case 'berat':
        return <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">BERAT (4P)</span>;
      case 'sedang':
        return <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">SEDANG (2P)</span>;
      case 'ringan':
      default:
        return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">RINGAN (1P)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white tracking-tight">Riwayat Catatan Pemakaian</h2>
            </div>
            <p className="text-xs text-slate-400">
              Audit jejak aktivitas pembuatan konten, tugas soal, dan beban kerja setiap akun AI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors min-h-[44px]"
              title="Unduh seluruh riwayat dalam format spreadsheet CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Ekspor CSV</span>
            </button>
            <button
              onClick={onOpenQuickLog}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Tugas</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-indigo-400" /> Filter Akun
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Akun ({accounts.length})</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.alias}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-cyan-400" /> Filter Kategori
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" /> Tingkat Beban
            </label>
            <select
              value={selectedLoad}
              onChange={(e) => setSelectedLoad(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Semua Tingkat</option>
              <option value="ringan">Ringan (1 Poin)</option>
              <option value="sedang">Sedang (2 Poin)</option>
              <option value="berat">Berat (4 Poin)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {filteredLogs.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">Belum ada catatan pemakaian untuk filter ini.</p>
          <p className="text-xs mt-1">Gunakan tombol "Catat Tugas" untuk menambahkan log baru.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const formattedDate = date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = date.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:px-6 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getLoadBadge(log.load)}
                      <span className="text-xs font-semibold text-indigo-400">
                        {accMap.get(log.accountId) || 'Akun AI'}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs text-slate-400">
                        {catMap.get(log.categoryId) || 'Kategori'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {log.taskTitle}
                    </h4>

                    {log.note && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        "{log.note}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800/60">
                    <div className="text-right text-[11px] text-slate-400 font-mono tabular-nums">
                      <div>{formattedDate}</div>
                      <div className="text-slate-500">{formattedTime} WIB</div>
                    </div>

                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Hapus Catatan Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
