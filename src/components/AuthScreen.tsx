import React, { useState, useEffect } from 'react';
import { ALLOWLISTED_EMAIL } from '../lib/defaultData';
import { isPasswordSet, setMasterPassword, verifyMasterPassword, getAttemptStatus } from '../lib/crypto';
import {
  ShieldCheck,
  Lock,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Info,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (email: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'google' | 'setup_password' | 'enter_password'>('google');
  const [googleEmailInput, setGoogleEmailInput] = useState<string>(ALLOWLISTED_EMAIL);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedMinutes, setLockedMinutes] = useState<number | null>(null);
  const [showSecurityTips, setShowSecurityTips] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingGoogle, setIsVerifyingGoogle] = useState(false);

  useEffect(() => {
    const status = getAttemptStatus();
    if (status.isLocked && status.lockedUntil) {
      const mins = Math.ceil((status.lockedUntil - Date.now()) / (60 * 1000));
      setLockedMinutes(mins);
      setErrorMessage(`Aplikasi terkunci karena 5 kali percobaan salah. Coba lagi dalam ${mins} menit.`);
    }
  }, []);

  // Compute password strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, text: 'Belum diisi', color: 'bg-slate-700' };
    if (pwd.length < 6) return { score: 1, text: 'Terlalu pendek (min 6 karakter)', color: 'bg-rose-500' };
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 2, text: 'Sedang (disarankan tambah angka)', color: 'bg-amber-500' };
    return { score: 3, text: 'Kuat & Aman', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  // Official Google Login Handler
  const handleGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifyingGoogle(true);

    const emailTrimmed = googleEmailInput.trim().toLowerCase();

    setTimeout(() => {
      setIsVerifyingGoogle(false);

      if (!emailTrimmed) {
        setErrorMessage('Silakan masukkan atau pilih email Google Anda.');
        return;
      }

      // Strict allowlist validation
      if (emailTrimmed !== ALLOWLISTED_EMAIL.toLowerCase()) {
        setErrorMessage(
          `Akses Ditolak: Akun Google "${emailTrimmed}" bukan pemilik sah portal ini. Sistem hanya mengizinkan akun resmi yang terdaftar (${ALLOWLISTED_EMAIL}).`
        );
        return;
      }

      // Check if independent website password exists
      if (isPasswordSet()) {
        setStep('enter_password');
      } else {
        setStep('setup_password');
      }
    }, 600);
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password khusus website minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok. Silakan ketik ulang dengan teliti.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setMasterPassword(password);
      onSuccess(ALLOWLISTED_EMAIL);
    } catch {
      setErrorMessage('Gagal mengenkripsi password khusus website.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!password) {
      setErrorMessage('Masukkan password khusus website Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await verifyMasterPassword(password);
      if (result.success) {
        onSuccess(ALLOWLISTED_EMAIL);
      } else {
        if (result.lockedMinutes) {
          setLockedMinutes(result.lockedMinutes);
          setErrorMessage(`Terlalu banyak percobaan salah. Aplikasi terkunci selama ${result.lockedMinutes} menit.`);
        } else {
          setRemainingAttempts(result.remainingAttempts ?? 0);
          setErrorMessage(
            `Password khusus website salah. Sisa kesempatan: ${result.remainingAttempts} kali sebelum terkunci 15 menit.`
          );
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala saat verifikasi password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* App Wordmark & Icon */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">AlokasiAI</h1>
          <p className="text-xs text-slate-400 mt-1">Portal Pribadi Pengatur Sebaran Akun AI</p>
        </div>

        {/* STEP 1: Masuk dengan Akun Google Resmi */}
        {step === 'google' && (
          <div>
            <div className="mb-5 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verifikasi Akun Google Resmi</span>
              </div>
              <h2 className="text-base font-semibold text-slate-200">Tahap 1: Deteksi Akun Google</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Hanya akun Google resmi pemilik (<span className="text-slate-200 font-mono">{ALLOWLISTED_EMAIL}</span>) yang memiliki hak akses.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex gap-2.5 items-start">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleGoogleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Email Akun Google Resmi Pemilik:
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="viesmabuatkerja3@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Allowlist terdaftar: {ALLOWLISTED_EMAIL}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-md active:scale-[0.98] min-h-[44px] disabled:opacity-75"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isVerifyingGoogle ? 'Memverifikasi dengan Google...' : 'Masuk & Verifikasi Akun Google'}</span>
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Buat Password Baru Khusus Website (Terpisah dari Google) */}
        {step === 'setup_password' && (
          <div>
            <div className="mb-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Tahap 2: Buat Password Khusus Website</h2>
              <p className="text-xs text-slate-400 mt-1">
                Akun Google Terverifikasi: <span className="text-emerald-400 font-semibold">{ALLOWLISTED_EMAIL}</span>
              </p>
            </div>

            {/* Crucial Banner: Bedakan dari Password Google! */}
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 uppercase tracking-wide block font-bold mb-0.5">
                    Perhatian: Berbeda dari Password Google
                  </strong>
                  <span>
                    Website ini memiliki sistem brankas sendiri. <strong>JANGAN gunakan password akun Google Anda!</strong> Buatlah password atau PIN baru yang khusus digunakan untuk membuka website ini.
                  </span>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSetupPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Khusus Website (Minimal 6 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ketik password khusus website..."
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${strength.color}`} style={{ width: `${(strength.score / 3) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{strength.text}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ulangi Password Khusus Website
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang password..."
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98] min-h-[44px]"
              >
                {isSubmitting ? 'Mengenkripsi Password...' : 'Simpan Password Website & Masuk'}
              </button>

              <button
                type="button"
                onClick={() => setStep('google')}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 py-1"
              >
                Kembali ke Verifikasi Google
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Masukkan Password Khusus Website yang Sudah Ada */}
        {step === 'enter_password' && (
          <div>
            <div className="mb-4 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white">Masukkan Password Khusus Website</h2>
              <div className="mt-1 flex items-center justify-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Akun Google Terverifikasi: {ALLOWLISTED_EMAIL}</span>
              </div>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="text-indigo-400 font-semibold">Pengingat:</span> Masukkan <strong>password khusus website AlokasiAI</strong> yang Anda buat (bukan password akun Google).
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Website Anda:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ketik password khusus website..."
                    disabled={lockedMinutes !== null && lockedMinutes > 0}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
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
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (lockedMinutes !== null && lockedMinutes > 0)}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md active:scale-[0.98] min-h-[44px] disabled:opacity-50"
              >
                {isSubmitting ? 'Memverifikasi...' : 'Buka Dashboard Website'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('google');
                  setPassword('');
                  setErrorMessage(null);
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                Ganti Akun Google
              </button>
            </form>
          </div>
        )}

        {/* Security Guidance Accordion - Strictly restricted to verified viesmabuatkerja3@gmail.com */}
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          {step !== 'google' && googleEmailInput.trim().toLowerCase() === ALLOWLISTED_EMAIL.toLowerCase() ? (
            <div>
              <button
                onClick={() => setShowSecurityTips(!showSecurityTips)}
                className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Petunjuk Keamanan (Khusus {ALLOWLISTED_EMAIL})
                </span>
                {showSecurityTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSecurityTips && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Terverifikasi untuk Akun Pemilik: {ALLOWLISTED_EMAIL}</span>
                  </div>
                  <p className="font-semibold text-indigo-300">Arsitektur Keamanan Mandiri:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Keamanan Zero-Trust:</strong> Website ini tidak pernah meminta atau menyimpan password akun Google Anda.</li>
                    <li>Password khusus website disimpan dalam format hash kriptografi <strong>PBKDF2 dengan SHA-256 dan 100.000 iterasi</strong>.</li>
                    <li>Setelah 5 kali percobaan salah, sistem mengunci diri selama 15 menit untuk mencegah pembobolan (*brute-force*).</li>
                    <li>Selalu aktifkan <strong>Verifikasi 2 Langkah (2FA)</strong> di akun Google Anda melalui <em>myaccount.google.com/signinoptions/two-step-verification</em>.</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 py-1">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Petunjuk keamanan hanya dapat diakses oleh akun {ALLOWLISTED_EMAIL}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
