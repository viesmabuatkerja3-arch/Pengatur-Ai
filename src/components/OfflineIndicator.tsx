import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside aria-label="Status Jaringan" className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 flex items-center gap-3 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Mode Offline — Perubahan tetap tersimpan di perangkat lokal.</span>
    </aside>
  );
};
