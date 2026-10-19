import React, { useState, useEffect } from 'react';
import { verifyMasterPassword, getAttemptStatus } from '../lib/crypto';
import { Lock, AlertTriangle, LogOut, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LockScreenProps {
  userEmail: string;
  onUnlock: () => void;
  onSignOut: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ userEmail, onUnlock, onSignOut }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedMinutes, setLockedMinutes] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const status = getAttemptStatus();
    if (status.isLocked && status.lockedUntil) {
      const mins = Math.ceil((status.lockedUntil - Date.now()) / (60 * 1000));
      setLockedMinutes(mins);
      setErrorMessage(`Aplikasi terkunci karena 5 kali percobaan salah. Coba lagi dalam ${mins} menit.`);
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage('Masukkan password khusus website.');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyMasterPassword(password);
      if (result.success) {
        onUnlock();
      } else {
        if (result.lockedMinutes) {
          setLockedMinutes(result.lockedMinutes);
          setErrorMessage(`Terlalu banyak percobaan salah. Aplikasi terkunci selama ${result.lockedMinutes} menit.`);
        } else {
          setRemainingAttempts(result.remainingAttempts ?? 0);
          setErrorMessage(
            `Password khusus website salah. Sisa kesempatan: ${result.remainingAttempts} kali.`
          );
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala saat verifikasi password.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md text-slate-100">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Lock className="w-7 h-7" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-white">Sesi Website Terkunci</h2>

        <div className="mt-2 mb-4 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center gap-1.5 text-xs text-slate-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Akun Google Resmi: <strong>{userEmail}</strong></span>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Masukkan <strong>password khusus website</strong> yang Anda buat (bukan password Google Anda).
        </p>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex gap-2 text-left">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password khusus website..."
              disabled={lockedMinutes !== null && lockedMinutes > 0}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 text-center placeholder-slate-500 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isVerifying || (lockedMinutes !== null && lockedMinutes > 0)}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98] min-h-[44px] disabled:opacity-50"
          >
            {isVerifying ? 'Membuka...' : 'Buka Kunci Layar'}
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi Akun Google</span>
          </button>
        </form>
      </div>
    </div>
  );
};
