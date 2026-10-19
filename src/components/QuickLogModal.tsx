import React, { useState, useEffect } from 'react';
import { AIAccount, TaskCategory, TaskLoad, UsageLog } from '../types';
import { X, CheckCircle, Flame, Zap, Feather } from 'lucide-react';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: Omit<UsageLog, 'id'>) => void;
  accounts: AIAccount[];
  categories: TaskCategory[];
  preselectedAccount?: AIAccount | null;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  accounts,
  categories,
  preselectedAccount,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [taskTitle, setTaskTitle] = useState('');
  const [load, setLoad] = useState<TaskLoad>('sedang');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (preselectedAccount) {
      setSelectedAccountId(preselectedAccount.id);
      // Auto pick best matching category for account role
      const matchedCat = categories.find((c) =>
        c.primaryAccountIds.includes(preselectedAccount.id)
      );
      if (matchedCat) {
        setSelectedCategoryId(matchedCat.id);
      } else if (categories.length > 0) {
        setSelectedCategoryId(categories[0].id);
      }
    } else {
      if (accounts.length > 0) setSelectedAccountId(accounts[0].id);
      if (categories.length > 0) setSelectedCategoryId(categories[0].id);
    }
    setTaskTitle('');
    setLoad('sedang');
    setNote('');
  }, [preselectedAccount, isOpen, accounts, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !selectedCategoryId || !taskTitle.trim()) return;

    onSaveLog({
      accountId: selectedAccountId,
      categoryId: selectedCategoryId,
      taskTitle: taskTitle.trim(),
      load,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    });
    onClose();
  };

  const loadOptions: { type: TaskLoad; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'ringan',
      label: 'Ringan',
      desc: '1-5 pertanyaan cepat / cek ringkas',
      icon: <Feather className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    },
    {
      type: 'sedang',
      label: 'Sedang',
      desc: '15-25 butir soal / 1 naskah video',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    },
    {
      type: 'berat',
      label: 'Berat',
      desc: '40-60+ soal HOTS / dokumen panjang',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Catat Pemakaian Akun</h3>
            <p className="text-xs text-slate-400 mt-0.5">Pantau beban kerja harian agar akun Claude tidak cepat limit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pilih Akun AI yang Digunakan <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.alias} ({acc.plan.toUpperCase()}) - {acc.status === 'limit' ? '⚠️ Kena Limit' : 'Siap'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kategori Tugas <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Judul Tugas / Aktivitas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Misal: Buat 30 Soal TIU Deret Angka Tryout 3"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Tingkat Beban Kerja Pemakaian
            </label>
            <div className="grid grid-cols-3 gap-2">
              {loadOptions.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setLoad(opt.type)}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[72px] ${
                    load === opt.type
                      ? `${opt.color} ring-1 ring-white/20 shadow-md`
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    {opt.icon}
                    {load === opt.type && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white mt-1.5">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-1">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Hasil / Kendala (Opsional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Misal: Prompt berhasil, output rapi, mendekati warning limit..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors min-h-[44px]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all active:scale-95 min-h-[44px]"
            >
              Simpan Pemakaian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
