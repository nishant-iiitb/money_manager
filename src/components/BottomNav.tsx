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

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around px-1 py-1 sm:py-1.5">
        {/* Expenses / Ledger */}
        <button
          onClick={() => onChangeTab('expenses')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
            activeTab === 'expenses'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ReceiptText className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Expenses</span>
        </button>

        {/* Accounts & Cards */}
        <button
          onClick={() => onChangeTab('accounts')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
            activeTab === 'accounts'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Accounts</span>
        </button>

        {/* P2P Borrow & Lending */}
        <button
          onClick={() => onChangeTab('p2p')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
            activeTab === 'p2p'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">P2P Lend</span>
        </button>

        {/* Quick Tap Widget (Big prominent center button) */}
        <button
          onClick={() => onChangeTab('quick-add')}
          className="relative -top-2.5 flex flex-col items-center justify-center group"
          title="Quick Tap Expense Entry"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 ${
              activeTab === 'quick-add'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 ring-4 ring-emerald-500/20 shadow-emerald-500/40'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
            }`}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-bold text-emerald-400 mt-0.5">Quick Add</span>
        </button>

        {/* Commitments & Budget */}
        <button
          onClick={() => onChangeTab('commitments')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
            activeTab === 'commitments'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarClock className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Budgets</span>
        </button>

        {/* Goals */}
        <button
          onClick={() => onChangeTab('goals')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
            activeTab === 'goals'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Goals</span>
        </button>

        {/* Analytics */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition ${
            activeTab === 'analytics'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4.5 h-4.5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Analytics</span>
        </button>
      </div>
    </nav>
  );
};
