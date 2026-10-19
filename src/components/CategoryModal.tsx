import React, { useState } from 'react';
import { TaskCategory, AIAccount } from '../types';
import { X, Plus, Trash2, FolderPlus, Check } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: TaskCategory[];
  accounts: AIAccount[];
  onSaveCategory: (category: Partial<TaskCategory>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveCategory({
      name: name.trim(),
      description: description.trim(),
      color,
      primaryAccountIds: selectedAccountIds,
      isCustom: true,
    });

    setName('');
    setDescription('');
    setSelectedAccountIds([]);
    setIsAdding(false);
  };

  const toggleAccountSelection = (accId: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const colors = [
    { id: 'indigo', name: 'Indigo' },
    { id: 'rose', name: 'Rose' },
    { id: 'cyan', name: 'Cyan' },
    { id: 'amber', name: 'Amber' },
    { id: 'emerald', name: 'Emerald' },
    { id: 'purple', name: 'Purple' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Kelola Kategori Tugas Konten</h3>
            <p className="text-xs text-slate-400 mt-0.5">Petakan kategori pekerjaan ke akun Claude yang sesuai</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing categories list */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Daftar Kategori Saat Ini ({categories.length})
            </span>
            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori Baru</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            {categories.map((c) => {
              const mappedAccounts = accounts.filter((a) => c.primaryAccountIds.includes(a.id));
              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{c.name}</span>
                      {c.isCustom && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-normal">
                          Kustom
                        </span>
                      )}
                    </h4>
                    {c.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{c.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-500 mr-1">Akun Utama:</span>
                      {mappedAccounts.length > 0 ? (
                        mappedAccounts.map((a) => (
                          <span
                            key={a.id}
                            className="text-[10px] font-medium text-slate-300 bg-slate-700/80 px-2 py-0.5 rounded-md"
                          >
                            {a.alias.split('-')[0].trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Belum dipetakan</span>
                      )}
                    </div>
                  </div>

                  {c.isCustom && (
                    <button
                      onClick={() => onDeleteCategory(c.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-700 transition-colors shrink-0"
                      title="Hapus Kategori Kustom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form add new category */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="mt-5 p-4 rounded-2xl bg-slate-800/90 border border-indigo-500/30 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4" />
                Kategori Baru
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Batal
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Kategori <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Modul Psikotes & Kesamaptaan"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Deskripsi Singkat
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tugas pembuatan panduan fisik dan tes wawancara..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Petakan ke Akun Utama
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {accounts.map((a) => {
                  const isChecked = selectedAccountIds.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAccountSelection(a.id)}
                      className={`p-2 rounded-xl text-left border text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-slate-700 bg-slate-900/60 text-slate-400'
                      }`}
                    >
                      <span className="truncate pr-1">{a.alias}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Simpan Kategori Baru
            </button>
          </form>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
