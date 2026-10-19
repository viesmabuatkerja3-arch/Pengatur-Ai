import React, { useState } from 'react';
import { PromptTemplate, TaskCategory, AIAccount } from '../types';
import { BookOpen, Copy, Check, Plus, Search, Tag, Trash2, Edit3, X } from 'lucide-react';

interface PromptLibraryProps {
  prompts: PromptTemplate[];
  categories: TaskCategory[];
  accounts: AIAccount[];
  onSavePrompt: (prompt: Partial<PromptTemplate>) => void;
  onDeletePrompt: (promptId: string) => void;
  onIncrementUsage: (promptId: string) => void;
}

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  prompts,
  categories,
  accounts,
  onSavePrompt,
  onDeletePrompt,
  onIncrementUsage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const openNewModal = () => {
    setEditingPrompt(null);
    setTitle('');
    setCategoryId(categories[0]?.id || '');
    setTargetAccountId('');
    setContent('');
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PromptTemplate) => {
    setEditingPrompt(p);
    setTitle(p.title);
    setCategoryId(p.categoryId);
    setTargetAccountId(p.targetAccountId || '');
    setContent(p.content);
    setTagsInput(p.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSavePrompt({
      id: editingPrompt ? editingPrompt.id : undefined,
      title: title.trim(),
      categoryId,
      targetAccountId: targetAccountId || undefined,
      content: content.trim(),
      tags,
      usageCount: editingPrompt ? editingPrompt.usageCount : 0,
      createdAt: editingPrompt ? editingPrompt.createdAt : new Date().toISOString(),
    });

    setIsModalOpen(false);
  };

  const handleCopy = (p: PromptTemplate) => {
    navigator.clipboard.writeText(p.content);
    setCopiedId(p.id);
    onIncrementUsage(p.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredPrompts = prompts.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const accMap = new Map(accounts.map((a) => [a.id, a.alias]));

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white tracking-tight">Perpustakaan Prompt Kedinasan & CPNS</h2>
            </div>
            <p className="text-xs text-slate-400">
              Koleksi prompt teruji untuk pembuatan soal HOTS, naskah video 60 detik, dan caption edukasi.
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all active:scale-95 shadow-md shrink-0 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Prompt Baru</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari prompt berdasarkan judul, tag, atau isi..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({prompts.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 text-center text-slate-400">
          <p className="text-sm font-semibold text-slate-300">Tidak ada template prompt yang cocok.</p>
          <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau tambah prompt baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPrompts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                    {catMap.get(p.categoryId) || 'Kategori'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Ubah Prompt"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePrompt(p.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Hapus Prompt"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight mb-2">
                  {p.title}
                </h3>

                {p.targetAccountId && (
                  <p className="text-[11px] text-slate-400 mb-2">
                    Khusus akun: <span className="text-slate-200 font-medium">{accMap.get(p.targetAccountId) || p.targetAccountId}</span>
                  </p>
                )}

                {/* Tags */}
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {p.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded-md"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-500" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Prompt Preview Snippet */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed line-clamp-4 select-all">
                  {p.content}
                </div>
              </div>

              {/* Action: Copy button */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 tabular-nums">
                  Disalin {p.usageCount} kali
                </span>
                <button
                  onClick={() => handleCopy(p)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 min-h-[40px] ${
                    copiedId === p.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {copiedId === p.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersalin ke Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Prompt</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Prompt */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingPrompt ? 'Ubah Template Prompt' : 'Tambah Template Prompt Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Judul Template Prompt <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Generator Soal HOTS Bela Negara"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kategori Tugas
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Akun (Opsional)
                  </label>
                  <select
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Semua Akun AI</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.alias}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tag / Kata Kunci (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="TWK, Pancasila, HOTS, STAN"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Isi Prompt Lengkap <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan prompt terstruktur di sini..."
                  rows={6}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 min-h-[44px]"
                >
                  Simpan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
