import React from 'react';
import { ActiveTab } from './Header';
import { LayoutGrid, ClipboardList, BarChart3, Sparkles, BookOpen } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  limitedAccountsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  limitedAccountsCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'accounts',
      label: 'Peta Akun',
      icon: <LayoutGrid className="w-5 h-5" />,
      badge: limitedAccountsCount > 0 ? limitedAccountsCount : undefined,
    },
    {
      id: 'recommender',
      label: 'Rekomendasi',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'logs',
      label: 'Catat',
      icon: <ClipboardList className="w-5 h-5" />,
    },
    {
      id: 'analytics',
      label: 'Sebaran',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'prompts',
      label: 'Prompt',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full text-[9px] bg-rose-500 text-white font-mono leading-tight">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[60px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
