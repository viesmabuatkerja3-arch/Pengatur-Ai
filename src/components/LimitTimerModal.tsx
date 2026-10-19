import React, { useState } from 'react';
import { AIAccount } from '../types';
import { Clock, X, AlertCircle } from 'lucide-react';

interface LimitTimerModalProps {
  account: AIAccount;
  isOpen: boolean;
  onClose: () => void;
  onConfirmLimit: (accountId: string, resetTime: string) => void;
}

export const LimitTimerModal: React.FC<LimitTimerModalProps> = ({
  account,
  isOpen,
  onClose,
  onConfirmLimit,
}) => {
  const [selectedHours, setSelectedHours] = useState<number>(3);
  const [customTime, setCustomTime] = useState<string>('');
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');

  if (!isOpen) return null;

  const handleSave = () => {
    let targetDate: Date;
    if (mode === 'preset') {
      targetDate = new Date(Date.now() + selectedHours * 60 * 60 * 1000);
    } else {
      if (!customTime) {
        targetDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
      } else {
        const [hours, minutes] = customTime.split(':').map(Number);
        targetDate = new Date();
        targetDate.setHours(hours, minutes, 0, 0);
        // If time is already past today, set to tomorrow
        if (targetDate.getTime() <= Date.now()) {
          targetDate.setDate(targetDate.getDate() + 1);
        }
      }
    }

    onConfirmLimit(account.id, targetDate.toISOString());
    onClose();
  };

  const presets = [
    { label: '1 Jam', hours: 1 },
    { label: '2 Jam', hours: 2 },
    { label: '3 Jam', hours: 3 },
    { label: '4 Jam', hours: 4 },
    { label: '5 Jam', hours: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-rose-400">
            <Clock className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Tandai Akun Kena Limit</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
          <p className="text-slate-400">Akun yang ditandai:</p>
          <p className="font-semibold text-slate-100 text-sm mt-0.5">{account.alias}</p>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Pilih Durasi Estimasi Reset Claude:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {presets.map((p) => (
              <button
                key={p.hours}
                type="button"
                onClick={() => {
                  setMode('preset');
                  setSelectedHours(p.hours);
                }}
                className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                  mode === 'preset' && selectedHours === p.hours
                    ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Atau Tentukan Jam Spesifik (Sesuai Info Claude):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={customTime}
              onChange={(e) => {
                setCustomTime(e.target.value);
                setMode('custom');
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
            />
            {mode === 'custom' && (
              <span className="text-xs text-rose-400 font-medium whitespace-nowrap">Mode Kustom Aktif</span>
            )}
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>
            Kartu akun akan menampilkan hitung mundur otomatis dan beralih kembali ke status <strong>Aktif</strong> begitu waktu reset tercapai.
          </span>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 min-h-[44px]"
          >
            Mulai Hitung Mundur
          </button>
        </div>
      </div>
    </div>
  );
};
