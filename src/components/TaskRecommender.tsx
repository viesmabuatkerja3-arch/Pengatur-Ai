import React, { useState } from 'react';
import { AIAccount, TaskCategory, UsageLog, PromptTemplate } from '../types';
import { Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Copy, Check, Lightbulb } from 'lucide-react';

interface TaskRecommenderProps {
  accounts: AIAccount[];
  categories: TaskCategory[];
  usageLogs: UsageLog[];
  prompts: PromptTemplate[];
  onSelectAccountToLog: (account: AIAccount, taskTitle: string, categoryId?: string) => void;
}

export const TaskRecommender: React.FC<TaskRecommenderProps> = ({
  accounts,
  categories,
  usageLogs,
  prompts,
  onSelectAccountToLog,
}) => {
  const [taskQuery, setTaskQuery] = useState('');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Suggested quick prompts for CPNS & Kedinasan
  const quickTaskChips = [
    'Buat 50 soal TIU deret angka pola bertingkat',
    'Naskah video Reels 60 detik trik silogisme',
    'Caption IG Carousel passing grade STAN & IPDN',
    'Paket 20 soal TWK HOTS implementasi Pancasila',
    'Rangkuman kisi-kisi resmi SKD BKN 2026',
  ];

  // Recommendation engine
  const getRecommendation = () => {
    if (!taskQuery.trim()) return null;

    const q = taskQuery.toLowerCase();

    // 1. Keyword mapping to categories
    let targetCatId = 'cat-soal';
    if (q.includes('video') || q.includes('reels') || q.includes('tiktok') || q.includes('naskah') || q.includes('hook') || q.includes('konten')) {
      targetCatId = 'cat-video';
    } else if (q.includes('poster') || q.includes('caption') || q.includes('desain') || q.includes('carousel') || q.includes('feed') || q.includes('instagram')) {
      targetCatId = 'cat-poster';
    } else if (q.includes('riset') || q.includes('materi') || q.includes('kisi-kisi') || q.includes('regulasi') || q.includes('uud') || q.includes('undang-undang')) {
      targetCatId = 'cat-riset';
    } else if (q.includes('soal') || q.includes('twk') || q.includes('tiu') || q.includes('tkp') || q.includes('skd') || q.includes('stan') || q.includes('ipdn') || q.includes('stis') || q.includes('tryout')) {
      targetCatId = 'cat-soal';
    }

    const matchedCat = categories.find((c) => c.id === targetCatId) || categories[0];

    // 2. Score accounts based on:
    // - Role match (+50 points)
    // - Status: 'aktif' (+100 points), 'limit' (-500 points), 'istirahat' (+10 points)
    // - Plan: Pro (+20 points for heavy tasks), Free (+10 points)
    // - Recent usage load in last 24h (-10 points per point of load)
    const now = Date.now();
    const oneDayAgo = now - 24 * 3600 * 1000;

    const scoredAccounts = accounts.map((acc) => {
      let score = 0;
      let reasons: string[] = [];

      // Category / Role affinity
      const isPrimary = matchedCat.primaryAccountIds.includes(acc.id);
      if (isPrimary) {
        score += 60;
        reasons.push(`Sesuai spesialisasi akun (${acc.role})`);
      } else if (acc.role.toLowerCase().includes(matchedCat.name.toLowerCase().split(' ')[0])) {
        score += 30;
        reasons.push('Memiliki relevansi tugas');
      }

      // Status check
      if (acc.status === 'aktif') {
        score += 100;
        reasons.push('Status saat ini Aktif & Siap digunakan');
      } else if (acc.status === 'limit') {
        score -= 500;
        reasons.push('Sedang mencapai batas limit pertanyaan');
      } else {
        score += 10;
        reasons.push('Sedang diistirahatkan (bisa diaktifkan)');
      }

      // Workload calculation
      const recentLogs = usageLogs.filter(
        (l) => l.accountId === acc.id && new Date(l.timestamp).getTime() > oneDayAgo
      );
      const totalLoadScore = recentLogs.reduce((sum, l) => {
        const weight = l.load === 'berat' ? 4 : l.load === 'sedang' ? 2 : 1;
        return sum + weight;
      }, 0);

      score -= totalLoadScore * 8;
      if (totalLoadScore === 0) {
        score += 20;
        reasons.push('Belum ada beban kerja dalam 24 jam terakhir (Sangat longgar)');
      } else {
        reasons.push(`Beban 24 jam terakhir: ${recentLogs.length} tugas (${totalLoadScore} beban poin)`);
      }

      return {
        account: acc,
        score,
        reasons,
        loadScore: totalLoadScore,
        isLimited: acc.status === 'limit',
      };
    });

    scoredAccounts.sort((a, b) => b.score - a.score);

    const bestChoice = scoredAccounts[0];
    const alternativeChoices = scoredAccounts.slice(1, 3);

    // Matching prompts
    const matchedPrompts = prompts.filter(
      (p) => p.categoryId === targetCatId || p.title.toLowerCase().includes(q)
    );

    return {
      category: matchedCat,
      bestChoice,
      alternativeChoices,
      matchedPrompts,
    };
  };

  const recommendation = getRecommendation();

  const handleCopyPrompt = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-bold text-white tracking-tight">Rekomendasi Akun & Sebaran Cerdas</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ketik tugas yang ingin Anda kerjakan. Sistem otomatis menganalisis peran akun, ketersediaan limit Claude, dan beban kerja 24 jam terakhir agar akun tidak cepat kena penalti limit.
          </p>

          {/* Input Box */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={taskQuery}
                onChange={(e) => setTaskQuery(e.target.value)}
                placeholder="Ketik tugas, contoh: 'Buat 50 soal TIU pola deret bertingkat'..."
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
              />
              {taskQuery && (
                <button
                  onClick={() => setTaskQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Quick example task triggers */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              Contoh cepat:
            </span>
            {quickTaskChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTaskQuery(chip)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Section */}
      {recommendation && (
        <div className="space-y-4">
          {/* Best Account Card */}
          <div className="rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-4 py-1.5 bg-indigo-600 text-[11px] font-bold text-white rounded-bl-2xl uppercase tracking-wider">
              Pilihan Akun Terbaik
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-semibold mb-1">
                  <span>Kategori Tugas: {recommendation.category.name}</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {recommendation.bestChoice.account.alias}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Peran Akun: <span className="text-slate-200 font-medium">{recommendation.bestChoice.account.role}</span>
                </p>

                {/* Reasons List */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-semibold text-slate-300">Alasan Pemilihan:</p>
                  {recommendation.bestChoice.reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="sm:self-end pt-3 sm:pt-0">
                <button
                  onClick={() =>
                    onSelectAccountToLog(
                      recommendation.bestChoice.account,
                      taskQuery,
                      recommendation.category.id
                    )
                  }
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                >
                  <span>Gunakan Akun Ini & Catat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Alternative Candidates if available */}
          {recommendation.alternativeChoices.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Opsi Alternatif Cadangan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendation.alternativeChoices.map((alt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-200">{alt.account.alias}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {alt.isLimited ? (
                          <span className="text-rose-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Sedang Limit
                          </span>
                        ) : (
                          <span>Beban 24j: {alt.loadScore} poin</span>
                        )}
                      </p>
                    </div>
                    {!alt.isLimited && (
                      <button
                        onClick={() =>
                          onSelectAccountToLog(
                            alt.account,
                            taskQuery,
                            recommendation.category.id
                          )
                        }
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        Pilih
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matched Prompts from Library */}
          {recommendation.matchedPrompts.length > 0 && (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Template Prompt Siap Pakai Terkait
              </h4>
              <div className="space-y-3">
                {recommendation.matchedPrompts.slice(0, 2).map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-800 border border-slate-700/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-100">{p.title}</span>
                      <button
                        onClick={() => handleCopyPrompt(p.content, p.id)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                      >
                        {copiedPromptId === p.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-[11px] text-slate-300 whitespace-pre-wrap font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-700/50 max-h-36 overflow-y-auto">
                      {p.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
