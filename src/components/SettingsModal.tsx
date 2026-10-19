import React, { useState } from 'react';
import { AppSettings } from '../types';
import {
  X,
  Shield,
  KeyRound,
  Download,
  Upload,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  exportAllDataAsJSON,
  importAllDataFromJSON,
  downloadFile,
  resetAllDataToDefault,
} from '../lib/storage';
import { verifyMasterPassword, setMasterPassword } from '../lib/crypto';
import { ALLOWLISTED_EMAIL } from '../lib/defaultData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  onDataRestored: () => void;
  userEmail?: string | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onDataRestored,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'security' | 'backup' | 'session'>('security');

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Inactivity timeout state
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(settings.sessionTimeoutMinutes);

  // Import State
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 6) {
      setPwdError('Password khusus website minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Konfirmasi password baru tidak cocok.');
      return;
    }

    setIsChangingPwd(true);
    try {
      const verifyRes = await verifyMasterPassword(oldPassword);
      if (!verifyRes.success) {
        setPwdError('Password lama website tidak cocok.');
        setIsChangingPwd(false);
        return;
      }

      await setMasterPassword(newPassword);
      setPwdSuccess('Password khusus website berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPwdError('Gagal memperbarui password.');
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSaveTimeout = () => {
    onSaveSettings({
      ...settings,
      sessionTimeoutMinutes: timeoutMinutes,
    });
    onClose();
  };

  const handleExportJSON = () => {
    const jsonStr = exportAllDataAsJSON();
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `cadangan_alokasiai_${dateStr}.json`, 'application/json');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importAllDataFromJSON(content);
      setImportStatus(res);
      if (res.success) {
        onDataRestored();
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    resetAllDataToDefault();
    setConfirmReset(false);
    onDataRestored();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400">
            <Shield className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Pengaturan & Keamanan Mandiri</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="mt-4 flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Password Website
          </button>
          <button
            onClick={() => setActiveTab('session')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'session'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sesi & Kunci Layar
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadangan & Ekspor
          </button>
        </div>

        {/* TAB 1: Security & Password */}
        {activeTab === 'security' && (
          <div className="mt-5 space-y-5">
            {/* Status of Google Account Binding */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Akun Google Resmi Terdaftar:
                </p>
                <p className="text-xs font-bold text-slate-100 mt-0.5">{settings.allowlistedEmail}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terverifikasi</span>
              </div>
            </div>

            {/* Crucial Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-200 uppercase tracking-wide block font-bold mb-0.5">
                    Password Website Berbeda Dari Password Akun Google
                  </strong>
                  <span>
                    Password di bawah ini adalah password mandiri khusus untuk web AlokasiAI ini. <strong>Jangan gunakan password akun Google Anda</strong>.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4 text-indigo-400" />
                Ganti Password Khusus Website
              </h4>
              <p className="text-xs text-slate-400">
                Gunakan password ini setiap kali membuka sesi baru atau saat layar terkunci otomatis.
              </p>

              {pwdError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{pwdSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password Lama Khusus Website
                  </label>
                  <div className="relative">
                    <input
                      type={showOld ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(!showOld)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showOld ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password Baru (min 6 karakter)
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ulangi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPwd}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all active:scale-95 shadow-sm min-h-[40px]"
                >
                  {isChangingPwd ? 'Menyimpan...' : 'Perbarui Password Website'}
                </button>
              </form>
            </div>

            {/* Google 2FA Guidelines - Restricted to viesmabuatkerja3@gmail.com */}
            <div className="pt-4 border-t border-slate-800">
              {userEmail?.toLowerCase() === ALLOWLISTED_EMAIL.toLowerCase() ? (
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Petunjuk Khusus Akun Terverifikasi: {ALLOWLISTED_EMAIL}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-200">
                        Aktifkan Verifikasi 2 Langkah (2FA) di Akun Google
                      </h5>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Untuk keamanan maksimal akun kreator dan data tryout Anda, pastikan email <strong className="text-slate-200">{settings.allowlistedEmail}</strong> sudah terlindungi dengan verifikasi 2 langkah Google.
                      </p>
                      <a
                        href="https://myaccount.google.com/signinoptions/two-step-verification"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold mt-2.5"
                      >
                        <span>Buka Halaman Keamanan Google</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Shield className="w-4 h-4 text-slate-600" />
                    <span>Petunjuk keamanan hanya dapat diakses oleh akun resmi {ALLOWLISTED_EMAIL}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Session & Auto-Lock */}
        {activeTab === 'session' && (
          <div className="mt-5 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                <Clock className="w-4 h-4 text-indigo-400" />
                Batas Waktu Tidak Aktif (Auto Lock)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Jika aplikasi ditinggalkan terbuka tanpa aktivitas, layar otomatis terkunci dan meminta password khusus website Anda kembali.
              </p>

              <div className="mt-3 space-y-2">
                {[
                  { value: 5, label: '5 Menit (Sangat Ketat - Direkomendasikan di tempat umum)' },
                  { value: 15, label: '15 Menit' },
                  { value: 30, label: '30 Menit (Standar)' },
                  { value: 60, label: '1 Jam' },
                  { value: 0, label: 'Jangan pernah kunci otomatis' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      timeoutMinutes === opt.value
                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeout"
                      checked={timeoutMinutes === opt.value}
                      onChange={() => setTimeoutMinutes(opt.value)}
                      className="accent-indigo-500"
                    />
                    <span className="text-xs font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveTimeout}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md active:scale-95 min-h-[44px]"
                >
                  Simpan Batas Waktu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Backup & Export */}
        {activeTab === 'backup' && (
          <div className="mt-5 space-y-5">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                <Download className="w-4 h-4 text-emerald-400" />
                Ekspor Cadangan Lengkap (JSON)
              </h4>
              <p className="text-xs text-slate-400">
                Unduh seluruh data akun AI, kategori tugas, riwayat pemakaian, dan template prompt ke file JSON lokal.
              </p>
              <button
                onClick={handleExportJSON}
                className="mt-2.5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Cadangan JSON</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mb-1">
                <Upload className="w-4 h-4 text-cyan-400" />
                Pulihkan Cadangan (Impor JSON)
              </h4>
              <p className="text-xs text-slate-400">
                Pindahkan data antar perangkat (HP ke laptop) dengan mengunggah file JSON cadangan Anda.
              </p>

              {importStatus && (
                <div
                  className={`mt-2.5 p-3 rounded-xl text-xs flex items-center gap-2 ${
                    importStatus.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{importStatus.message}</span>
                </div>
              )}

              <label className="mt-2.5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors min-h-[44px]">
                <Upload className="w-4 h-4" />
                <span>Pilih File JSON Cadangan...</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                <RotateCcw className="w-4 h-4" />
                Reset Data ke Demo Awal
              </h4>
              <p className="text-xs text-slate-400">
                Mengembalikan data contoh bawaan Sekolah Kedinasan & CPNS (4 akun, 5 prompt, dan riwayat).
              </p>

              {confirmReset ? (
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-rose-400 font-semibold">Yakin reset semua data?</span>
                  <button
                    onClick={handleResetDemoData}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Ya, Reset
                  </button>
                  <button
                    onClick={() => setConfirmReset(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmReset(true)}
                  className="mt-2.5 px-3.5 py-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-semibold transition-colors"
                >
                  Muat Ulang Contoh Data Awal
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
