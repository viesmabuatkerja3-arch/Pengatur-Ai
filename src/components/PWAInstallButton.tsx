import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-transform shrink-0"
        title="Pasang aplikasi di layar utama HP/Tablet"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="whitespace-nowrap">Pasang PWA</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors shrink-0"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span className="whitespace-nowrap">Pasang di iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">Pasang di Layar Utama iPhone</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="text-sm text-slate-300 space-y-2.5 my-4">
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-400">1.</span>
                  <span>Tekan tombol <strong>Share</strong> (ikon kotak panah ke atas) di menu Safari bawah.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-400">2.</span>
                  <span>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-indigo-400">3.</span>
                  <span>Tekan <strong>Tambah (Add)</strong> di pojok kanan atas.</span>
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-2 w-full rounded-xl bg-slate-800 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
