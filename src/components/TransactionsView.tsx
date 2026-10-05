import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Trash2,
  Calendar,
  Layers,
  CreditCard,
  Plus,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Transaction,
  CustomCategory,
} from '../types/finance';
import { CalculatedAccount, CalculatedCard } from '../hooks/useFinanceStore';
import { formatINR, formatDateDMY } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionsViewProps {
  transactions: Transaction[];
  categories: CustomCategory[];
  accounts: CalculatedAccount[];
  cards: CalculatedCard[];
  onDeleteTransaction: (id: string) => void;
  onOpenQuickAdd: () => void;
  onOpenCategoriesModal: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  categories,
  accounts,
  cards,
  onDeleteTransaction,
  onOpenQuickAdd,
  onOpenCategoriesModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [accountFilter, setAccountFilter] = useState('ALL');

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesItem = tx.item.toLowerCase().includes(q);
        const matchesCat = tx.category.toLowerCase().includes(q);
        const matchesNotes = (tx.notes || '').toLowerCase().includes(q);
        if (!matchesItem && !matchesCat && !matchesNotes) return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL') {
        if (tx.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Account filter
      if (accountFilter !== 'ALL') {
        if (tx.accountId !== accountFilter) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, categoryFilter, accountFilter]);

  // Aggregates for filtered view
  const { totalExpense, totalIncome } = useMemo(() => {
    let exp = 0;
    let inc = 0;
    for (const tx of filteredTransactions) {
      if (tx.type === 'expense') exp += tx.amount;
      else if (tx.type === 'income') inc += tx.amount;
    }
    return { totalExpense: exp, totalIncome: inc };
  }, [filteredTransactions]);

  const resolveAccountName = (accountId: string) => {
    const acct = accounts.find((a) => a.id === accountId);
    if (acct) return { name: acct.name, isCard: false };
    const card = cards.find((c) => c.id === accountId);
    if (card) return { name: card.name, isCard: true };
    return { name: accountId, isCard: false };
  };

  const resolveCategoryMeta = (catName: string) => {
    const cat = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    return cat || { name: catName, color: '#94a3b8', iconName: 'Tag' };
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-16">
      {/* Header & Quick Add bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">Expense Tracker & Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Every single transaction with real-time account debits & category tags
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950/40 transition active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Tap Add Expense</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Spent (Filtered)</span>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono mt-0.5">
            {formatINR(totalExpense)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Transactions Logged</span>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-0.5">
            {filteredTransactions.length}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Custom Categories</span>
            <span className="text-sm font-bold text-emerald-400">{categories.length} Active</span>
          </div>
          <button
            onClick={onOpenCategoriesModal}
            className="text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-medium flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manage</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions (e.g. Taxi, Fuel, Cake, Blinkit, Maid)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-white text-xs outline-hidden cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
            <span className="text-slate-400 text-[11px]">Account/Card:</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="bg-transparent text-white text-xs outline-hidden cursor-pointer"
            >
              <option value="ALL">All Payment Accounts</option>
              <optgroup label="Credit Cards">
                {cards.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (CC)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Bank Accounts & Wallets">
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.purpose})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {(categoryFilter !== 'ALL' || accountFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setAccountFilter('ALL');
                setSearchQuery('');
              }}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Transaction Entries ({filteredTransactions.length})
          </span>
          <span className="text-[11px] text-slate-400">Date format: DD-MM-YYYY</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredTransactions.map((tx) => {
            const catMeta = resolveCategoryMeta(tx.category);
            const acctInfo = resolveAccountName(tx.accountId);

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 hover:bg-slate-850/50 transition flex items-center justify-between gap-3 group"
              >
                {/* Left info: Icon, Item name, Category, Account */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: `${catMeta.color}25`, color: catMeta.color }}
                  >
                    <CategoryIcon name={catMeta.iconName} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white truncate">{tx.item}</span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatDateDMY(tx.date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.2 rounded-md"
                        style={{ backgroundColor: `${catMeta.color}15`, color: catMeta.color }}
                      >
                        {tx.category}
                      </span>

                      <span className="text-slate-600 text-xs">•</span>

                      <span className="text-[10px] font-medium text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700/60 flex items-center gap-1">
                        {acctInfo.isCard && <CreditCard className="w-2.5 h-2.5 text-amber-400" />}
                        <span>{acctInfo.name}</span>
                      </span>

                      {tx.notes && (
                        <span className="text-[10px] text-slate-500 italic truncate max-w-xs">
                          "{tx.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete Action */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold font-mono ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Delete transaction "${tx.item}" (${formatINR(tx.amount)})?`)) {
                        onDeleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition opacity-80 sm:opacity-0 group-hover:opacity-100"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 p-4 text-slate-400 text-xs">
              No transactions match your search or filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
