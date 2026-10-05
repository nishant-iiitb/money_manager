import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Check,
  Calendar,
  Layers,
  ArrowRightLeft,
  PlusCircle,
  Delete,
} from 'lucide-react';
import {
  Transaction,
  CustomCategory,
  TransactionType,
} from '../types/finance';
import { CalculatedAccount, CalculatedCard } from '../hooks/useFinanceStore';
import { formatINR, getTodayDateString, getYesterdayDateString } from '../utils/formatters';
import { suggestCategory, getFrequentItems } from '../utils/categorizer';
import { CategoryIcon } from './CategoryIcon';

interface QuickTapWidgetProps {
  accounts: CalculatedAccount[];
  cards: CalculatedCard[];
  categories: CustomCategory[];
  history: Transaction[];
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onOpenCategoriesModal: () => void;
  onSuccess?: () => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const QuickTapWidget: React.FC<QuickTapWidgetProps> = ({
  accounts,
  cards,
  categories,
  history,
  onAddTransaction,
  onOpenCategoriesModal,
  onSuccess,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [item, setItem] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Travel');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [type, setType] = useState<TransactionType>('expense');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Set default account on mount if not selected (prefer Yes CC or BOB like user's sheet, or first account)
  useEffect(() => {
    if (!selectedAccountId) {
      if (cards.length > 0) {
        // default to first active card or first account
        setSelectedAccountId(cards.find(c => c.name.toLowerCase().includes('yes'))?.id || cards[0].id);
      } else if (accounts.length > 0) {
        setSelectedAccountId(accounts[0].id);
      }
    }
  }, [cards, accounts, selectedAccountId]);

  // Frequently used items from history
  const frequentItems = useMemo(() => getFrequentItems(history), [history]);

  // Real-time smart offline category suggestion
  const suggestion = useMemo(() => {
    return suggestCategory(item, history, categories);
  }, [item, history, categories]);

  // Auto-apply suggestion if confidence is high and user hasn't explicitly picked a different one yet
  useEffect(() => {
    if (suggestion && suggestion.confidence >= 0.8) {
      setSelectedCategory(suggestion.category);
    }
  }, [suggestion]);

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    const next = current + addValue;
    setAmountStr(next.toString());
  };

  const handleClearAmount = () => {
    setAmountStr('');
  };

  const handleSelectFrequentItem = (frequent: { item: string; category: string }) => {
    setItem(frequent.item);
    setSelectedCategory(frequent.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!selectedAccountId) {
      alert('Please select an account or credit card');
      return;
    }

    onAddTransaction({
      date,
      category: selectedCategory || 'Personal',
      item: item.trim() || selectedCategory || 'Expense',
      amount,
      type,
      accountId: selectedAccountId,
      notes: notes.trim(),
    });

    // Provide visual confirmation
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);

    // Reset fields for next fast entry
    setAmountStr('');
    setItem('');
    setNotes('');

    if (onSuccess) {
      onSuccess();
    }
  };

  // Selected account or card metadata for UI hint
  const selectedPaymentEntity = useMemo(() => {
    const acct = accounts.find((a) => a.id === selectedAccountId);
    if (acct) return { type: 'bank', item: acct };
    const card = cards.find((c) => c.id === selectedAccountId);
    if (card) return { type: 'card', item: card };
    return null;
  }, [selectedAccountId, accounts, cards]);

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Visual Accent Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-100 text-base sm:text-lg">Quick-Tap Expense</h2>
            <p className="text-xs text-slate-400">Fast 1-tap logging for iPhone & mobile</p>
          </div>
        </div>

        {/* Date Selector Chips */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDate(getTodayDateString())}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              date === getTodayDateString()
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDate(getYesterdayDateString())}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              date === getYesterdayDateString()
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yesterday
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-7 h-6 opacity-0 absolute cursor-pointer"
            title="Custom Date"
          />
          <span className="p-1 text-slate-400 pointer-events-none">
            <Calendar className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BIG AMOUNT DISPLAY & DIRECT INPUT */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center relative focus-within:border-emerald-500 transition">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Amount (INR)
          </label>
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">₹</span>
            <input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full text-center text-3xl sm:text-4xl font-extrabold bg-transparent text-white placeholder-slate-600 outline-hidden font-mono tracking-tight"
              autoFocus
            />
            {amountStr && (
              <button
                type="button"
                onClick={handleClearAmount}
                className="text-slate-500 hover:text-slate-300 p-1"
                title="Clear"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Quick-tap increment buttons */}
          <div className="grid grid-cols-6 gap-1.5 mt-3 pt-3 border-t border-slate-850">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAddAmount(amt)}
                className="py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-xs font-semibold text-slate-200 transition active:scale-95"
              >
                +{amt}
              </button>
            ))}
          </div>
        </div>

        {/* ITEM DESCRIPTION / AUTO-SUGGESTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              What did you spend on?
            </label>
            {suggestion && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Auto-detected: <strong>{suggestion.category}</strong>
              </span>
            )}
          </div>

          <input
            type="text"
            placeholder="e.g. Taxi, Fuel, Blinkit, Cake, Food Maid, Salon..."
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 outline-hidden transition"
          />

          {/* Quick frequent item chips */}
          {frequentItems.length > 0 && !item && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                Recent:
              </span>
              {frequentItems.map((freq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectFrequentItem(freq)}
                  className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-750 text-xs text-slate-300 border border-slate-700/60 whitespace-nowrap transition active:scale-95"
                >
                  {freq.item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CATEGORY SELECTOR (Custom + Default) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <button
              type="button"
              onClick={onOpenCategoriesModal}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              <Layers className="w-3 h-3" />
              Manage / Custom Categories
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition shrink-0 active:scale-95 ${
                    isSelected
                      ? 'bg-slate-100 text-slate-900 border-white shadow-md font-semibold'
                      : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                  style={{
                    borderLeftColor: isSelected ? undefined : cat.color,
                    borderLeftWidth: isSelected ? undefined : '3px',
                  }}
                >
                  <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PAYMENT ACCOUNT / CREDIT CARD SELECTOR */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              Paid With (Account / Card)
            </label>
            {selectedPaymentEntity && (
              <span className="text-[11px] text-slate-400">
                {selectedPaymentEntity.type === 'card' ? (
                  <>
                    Avail Limit:{' '}
                    <strong className="text-slate-200">
                      {formatINR((selectedPaymentEntity.item as CalculatedCard).effectiveAvailableLimit, false)}
                    </strong>
                  </>
                ) : (
                  <>
                    Live Balance:{' '}
                    <strong className="text-emerald-400">
                      {formatINR((selectedPaymentEntity.item as CalculatedAccount).currentBalance, false)}
                    </strong>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
            {/* Credit Cards first (since most daily expenses are CC) */}
            {cards.map((card) => {
              const isSelected = selectedAccountId === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setSelectedAccountId(card.id)}
                  className={`text-left p-2.5 rounded-xl border transition relative text-xs ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold truncate pr-1">{card.name}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-amber-400 font-bold">
                      CC
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Avail: {formatINR(card.effectiveAvailableLimit, false)}
                  </div>
                </button>
              );
            })}

            {/* Savings & Wallets */}
            {accounts.map((acct) => {
              const isSelected = selectedAccountId === acct.id;
              return (
                <button
                  key={acct.id}
                  type="button"
                  onClick={() => setSelectedAccountId(acct.id)}
                  className={`text-left p-2.5 rounded-xl border transition relative text-xs ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold truncate pr-1">{acct.name}</span>
                    <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-sky-400 font-bold">
                      {acct.purpose || 'Bank'}
                    </span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono font-medium truncate">
                    {formatINR(acct.currentBalance, false)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!amountStr || parseFloat(amountStr) <= 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/50 transition active:scale-98 flex items-center justify-center gap-2"
        >
          {showSuccessToast ? (
            <>
              <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
              <span>Transaction Recorded!</span>
            </>
          ) : (
            <>
              <span>Save Expense</span>
              {amountStr && parseFloat(amountStr) > 0 && (
                <span className="font-mono font-extrabold">({formatINR(parseFloat(amountStr))})</span>
              )}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
