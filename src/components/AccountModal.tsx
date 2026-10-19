import React, { useState, useEffect } from 'react';
import { AIAccount, AccountPlan, AccountStatus } from '../types';
import { X, Trash2, Check } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<AIAccount>) => void;
  onDelete?: (accountId: string) => void;
  initialAccount?: AIAccount | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialAccount,
}) => {
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [plan, setPlan] = useState<AccountPlan>('pro');
  const [status, setStatus] = useState<AccountStatus>('aktif');
  const [color, setColor] = useState('indigo');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (initialAccount) {
      setAlias(initialAccount.alias);
      setEmail(initialAccount.email || '');
      setRole(initialAccount.role);
      setPlan(initialAccount.plan);
      setStatus(initialAccount.status);
      setColor(initialAccount.color || 'indigo');
      setNotes(initialAccount.notes || '');
    } else {
      setAlias('');
      setEmail('');
      setRole('');
      setPlan('pro');
      setStatus('aktif');
      setColor('indigo');
      setNotes('');
    }
    setConfirmDelete(false);
  }, [initialAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim() || !role.trim()) return;

    onSave({
      id: initialAccount ? initialAccount.id : undefined,
      alias: alias.trim(),
      email: email.trim() || undefined,
      role: role.trim(),
      plan,
      status,
      color,
      notes: notes.trim(),
      archived: initialAccount ? initialAccount.archived : false,
      limitResetAt: initialAccount ? initialAccount.limitResetAt : null,
    });
    onClose();
  };

  const colors = [
    { id: 'indigo', name: 'Indigo (Soal SKD)', bg: 'bg-indigo-500' },
    { id: 'rose', name: 'Rose (Video)', bg: 'bg-rose-500' },
    { id: 'cyan', name: 'Cyan (Poster)', bg: 'bg-cyan-500' },
    { id: 'amber', name: 'Amber (Riset)', bg: 'bg-amber-500' },
    { id: 'emerald', name: 'Emerald (Cadangan)', bg: 'bg-emerald-500' },
    { id: 'purple', name: 'Purple (Khusus)', bg: 'bg-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            {initialAccount ? 'Ubah Informasi Akun AI' : 'Tambah Akun AI Baru'}
          </h3>
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
              Nama Alias Akun <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="Contoh: Claude 1 (Pro) - Soal SKD"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Akun (Opsional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email.claude@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Jenis Paket
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value as AccountPlan)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="pro">Claude Pro ($20/bln)</option>
                <option value="free">Claude Free (Gratis)</option>
                <option value="team">Claude Team</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Peran / Tugas Utama <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Contoh: Pembuatan Soal TWK, TIU, TKP & Pembahasan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Warna Penanda Kartu
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    color === c.id
                      ? 'border-white bg-slate-700 text-white shadow-sm'
                      : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span>{c.name.split(' ')[0]}</span>
                  {color === c.id && <Check className="w-3 h-3 text-white ml-0.5" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Khusus / Tips Pemakaian
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Akun ini hemat token, jangan upload PDF tebal, fokus butir soal cepat..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Security advisory notice */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/80 text-[11px] text-slate-400">
            <strong className="text-amber-400">Peringatan:</strong> Demi keamanan akun Anda, jangan pernah menuliskan password Claude di dalam catatan ini.
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
            {initialAccount && onDelete ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-rose-400">Yakin hapus?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(initialAccount.id)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus Akun</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-2">
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
                Simpan Akun
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
