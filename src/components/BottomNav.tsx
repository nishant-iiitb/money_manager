import React from 'react';
import {
  ReceiptText,
  Plus,
  Landmark,
  Users,
  CalendarClock,
  Target,
  BarChart3,
} from 'lucide-react';

export type ActiveTab =
  | 'expenses'
  | 'quick-add'
  | 'accounts'
  | 'p2p'
  | 'commitments'
  | 'goals'
  | 'analytics';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'expenses', label: 'Expenses', icon: ReceiptText },
  { id: 'accounts', label: 'Accounts', icon: Landmark },
  { id: 'p2p', label: 'P2P Lend', icon: Users },
  { id: 'quick-add', label: 'Quick Add', icon: Plus },
  { id: 'commitments', label: 'Budgets', icon: CalendarClock },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-2xl mx-auto flex items-stretch justify-between px-1 py-1 sm:py-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`flex-1 min-w-0 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition cursor-pointer ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5 shrink-0" />
              <span className="text-[10px] tracking-tight truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
