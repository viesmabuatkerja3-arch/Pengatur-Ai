import React, { useState, useEffect } from 'react';
import { AIAccount } from '../types';
import { Clock, Play, Pause, AlertCircle, Edit2, Archive, CheckCircle2, MoreVertical, PlusCircle } from 'lucide-react';

interface AccountCardProps {
  account: AIAccount;
  onEdit: (account: AIAccount) => void;
  onStatusChange: (accountId: string, status: AIAccount['status'], limitResetAt?: string | null) => void;
  onOpenLimitModal: (account: AIAccount) => void;
  onQuickLog: (account: AIAccount) => void;
  onToggleArchive: (accountId: string) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onStatusChange,
  onOpenLimitModal,
  onQuickLog,
  onToggleArchive,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Live countdown timer for accounts marked as 'limit'
  useEffect(() => {
    if (account.status !== 'limit' || !account.limitResetAt) {
      setTimeLeft('');
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const target = new Date(account.limitResetAt!).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('Waktu reset tercapai');
        onStatusChange(account.id, 'aktif', null);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}j ${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [account.status, account.limitResetAt, account.id, onStatusChange]);

  // Color mapping based on account role/color
  const colorStyles: Record<string, { border: string; bg: string; text: string; badge: string }> = {
    indigo: {
      border: 'border-indigo-500/30 hover:border-indigo-500/60',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      badge: 'bg-indigo-500/20 text-indigo-300',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-500/60',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
    },
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-500/60',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-500/60',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-300',
    },
  };

  const scheme = colorStyles[account.color] || colorStyles.indigo;

  return (
    <div
      className={`relative rounded-2xl bg-slate-900 border ${scheme.border} p-5 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
        account.archived ? 'opacity-60' : ''
      }`}
    >
      <div>
        {/* Card Header: Role & Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${scheme.badge}`}
            >
              {account.plan}
            </span>
            <span className="text-xs text-slate-400">·</span>
            {account.status === 'aktif' && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aktif / Siap Pakai
              </span>
            )}
            {account.status === 'limit' && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Kena Limit
              </span>
            )}
            {account.status === 'istirahat' && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Pause className="w-3.5 h-3.5" />
                Istirahat
              </span>
            )}
          </div>

          {/* Action Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Menu akun"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-7 w-40 rounded-xl bg-slate-800 border border-slate-700 shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onEdit(account);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                    Ubah Akun
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleArchive(account.id);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Archive className="w-3.5 h-3.5 text-amber-400" />
                    {account.archived ? 'Buka Arsip' : 'Arsipkan Akun'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Alias & Email */}
        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
          {account.alias}
        </h3>
        {account.email && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{account.email}</p>
        )}

        {/* Main Role / Task Spec */}
        <div className="mt-3 py-2 px-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Peran Utama:</p>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-relaxed">{account.role}</p>
        </div>

        {/* Notes */}
        {account.notes && (
          <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed italic">
            "{account.notes}"
          </p>
        )}

        {/* Limit Countdown Banner if status is 'limit' */}
        {account.status === 'limit' && (
          <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-medium">
              <Clock className="w-4 h-4 shrink-0 text-rose-400 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <p className="text-[10px] text-rose-400 uppercase tracking-wider font-semibold">Hitung Mundur Reset:</p>
                <p className="font-mono text-xs font-bold tabular-nums text-rose-200">{timeLeft || 'Memperbarui...'}</p>
              </div>
            </div>
            <button
              onClick={() => onStatusChange(account.id, 'aktif', null)}
              className="text-[11px] font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              Pulihkan
            </button>
          </div>
        )}
      </div>

      {/* Footer Controls: Quick Actions */}
      <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {account.status === 'aktif' ? (
            <>
              <button
                onClick={() => onOpenLimitModal(account)}
                className="px-2.5 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500/60 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors"
                title="Tandai akun terkena batas limit pertanyaan Claude"
              >
                Set Limit
              </button>
              <button
                onClick={() => onStatusChange(account.id, 'istirahat', null)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                title="Rehatkan akun sementara"
              >
                Istirahatkan
              </button>
            </>
          ) : (
            <button
              onClick={() => onStatusChange(account.id, 'aktif', null)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/40 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3" />
              Aktifkan
            </button>
          )}
        </div>

        <button
          onClick={() => onQuickLog(account)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          title="Catat pemakaian tugas langsung ke akun ini"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Catat Tugas</span>
        </button>
      </div>
    </div>
  );
};
