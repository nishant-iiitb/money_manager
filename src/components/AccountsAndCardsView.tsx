import React, { useState } from 'react';
import {
  Landmark,
  CreditCard as CreditCardIcon,
  Plus,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  AlertCircle,
  X,
  Check,
  Building,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  BankAccount,
  CreditCard,
  CreditCardPool,
} from '../types/finance';
import {
  CalculatedAccount,
  CalculatedCard,
  CalculatedPool,
} from '../hooks/useFinanceStore';
import { formatINR, formatCompactINR, formatPercent } from '../utils/formatters';

interface AccountsAndCardsViewProps {
  accounts: CalculatedAccount[];
  pools: CalculatedPool[];
  standaloneCards: CalculatedCard[];
  totalSavings: number;
  totalWallets: number;
  totalLiabilities: number;
  totalLimits: number;
  totalAvailableLimit: number;
  overallUtilization: number;
  onReconcileAccount: (accountId: string, newBalance: number) => void;
  onAddAccount: (acct: Omit<BankAccount, 'id'>) => void;
  onUpdateAccount: (acct: BankAccount) => void;
  onDeleteAccount: (id: string) => void;
  onAddCard: (card: Omit<CreditCard, 'id'>) => void;
  onUpdateCard: (card: CreditCard) => void;
  onDeleteCard: (id: string) => void;
  onAddCardPool: (pool: Omit<CreditCardPool, 'id'>) => void;
  onRecordCardPayment: (cardId: string, fromAccountId: string, amount: number) => void;
}

export const AccountsAndCardsView: React.FC<AccountsAndCardsViewProps> = ({
  accounts,
  pools,
  standaloneCards,
  totalSavings,
  totalWallets,
  totalLiabilities,
  totalLimits,
  totalAvailableLimit,
  overallUtilization,
  onReconcileAccount,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onAddCardPool,
  onRecordCardPayment,
}) => {
  const [subTab, setSubTab] = useState<'bank' | 'cards'>('bank');

  // Reconcile modal
  const [reconcilingAccount, setReconcilingAccount] = useState<CalculatedAccount | null>(null);
  const [newReconcileBalanceStr, setNewReconcileBalanceStr] = useState('');

  // Add Bank Account modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [acctName, setAcctName] = useState('');
  const [acctType, setAcctType] = useState<BankAccount['accountType']>('savings');
  const [acctInitialBalanceStr, setAcctInitialBalanceStr] = useState('');
  const [acctPurpose, setAcctPurpose] = useState('');
  const [acctNeededStr, setAcctNeededStr] = useState('0');

  // Pay Card Bill modal
  const [payingCard, setPayingCard] = useState<CalculatedCard | null>(null);
  const [payAmountStr, setPayAmountStr] = useState('');
  const [payFromAccountId, setPayFromAccountId] = useState(accounts[0]?.id || '');

  // Add Card Modal
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardBank, setCardBank] = useState('');
  const [cardPoolId, setCardPoolId] = useState('');
  const [cardLimitStr, setCardLimitStr] = useState('');
  const [cardLiabilityStr, setCardLiabilityStr] = useState('0');

  // Submit Reconcile
  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newReconcileBalanceStr);
    if (!reconcilingAccount || isNaN(val)) {
      alert('Please enter a valid balance');
      return;
    }
    onReconcileAccount(reconcilingAccount.id, val);
    setReconcilingAccount(null);
  };

  // Submit New Account
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acctName.trim()) {
      alert('Please enter account name');
      return;
    }
    const initialBalance = parseFloat(acctInitialBalanceStr) || 0;
    const neededMonthly = parseFloat(acctNeededStr) || 0;

    onAddAccount({
      name: acctName.trim(),
      accountType: acctType,
      initialBalance,
      purpose: acctPurpose.trim() || 'General',
      neededMonthly,
      color: '#0284c7',
    });

    setIsAddAccountOpen(false);
    setAcctName('');
    setAcctInitialBalanceStr('');
    setAcctPurpose('');
  };

  // Submit Card Bill Payment
  const handlePayCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmountStr);
    if (!payingCard || !amt || isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    if (!payFromAccountId) {
      alert('Please select a bank account to pay from');
      return;
    }

    onRecordCardPayment(payingCard.id, payFromAccountId, amt);
    setPayingCard(null);
    setPayAmountStr('');
  };

  // Submit New Card
  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) {
      alert('Please enter card name');
      return;
    }

    const standaloneLimit = cardPoolId ? undefined : parseFloat(cardLimitStr) || 100000;
    const initialLiability = parseFloat(cardLiabilityStr) || 0;

    onAddCard({
      name: cardName.trim(),
      bank: cardBank.trim() || cardName.trim(),
      poolId: cardPoolId || undefined,
      standaloneLimit,
      initialLiability,
      billedAmount: 0,
      color: '#2563eb',
      network: 'visa',
    });

    setIsAddCardOpen(false);
    setCardName('');
    setCardBank('');
    setCardLimitStr('');
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16">
      {/* Top Segmented SubTab Switcher */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('bank')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'bank'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Savings Accounts ({accounts.length})</span>
          </button>

          <button
            onClick={() => setSubTab('cards')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              subTab === 'cards'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            <span>Credit Cards & Pools</span>
          </button>
        </div>

        {subTab === 'bank' ? (
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Bank Account</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAddCardOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>Add Credit Card</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* 1. SAVINGS ACCOUNTS TAB */}
      {/* ========================================================= */}
      {subTab === 'bank' && (
        <div className="space-y-4">
          {/* Summary Banner matching Excel total ₹1,62,121 */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Real-Time Liquid Savings
              </span>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {formatINR(totalSavings)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Dynamically updated with every expense, income & transfer
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-2xl text-right">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Wallets / Benefits</span>
                <span className="font-bold text-sm text-purple-400 font-mono">{formatINR(totalWallets)}</span>
              </div>

              <button
                onClick={() => setIsAddAccountOpen(true)}
                className="sm:hidden p-2.5 rounded-xl bg-emerald-600 text-white"
                title="Add Account"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {accounts.map((acct) => {
              const diffFromInitial = acct.currentBalance - acct.initialBalance;
              return (
                <div
                  key={acct.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4.5 shadow-lg flex flex-col justify-between transition group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shrink-0 shadow-inner"
                          style={{ backgroundColor: acct.color }}
                        >
                          <Landmark className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-extrabold text-white text-base leading-tight">
                              {acct.name}
                            </h3>
                          </div>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 inline-block mt-0.5">
                            {acct.purpose || 'General'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setReconcilingAccount(acct);
                          setNewReconcileBalanceStr(acct.currentBalance.toString());
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition"
                        title="Reconcile with physical bank statement"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Current Real-time Balance */}
                    <div className="mt-3 bg-slate-950/70 border border-slate-850 rounded-2xl p-3">
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Live Current Balance</div>
                      <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                        {formatINR(acct.currentBalance)}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-850">
                        <span>Baseline: {formatINR(acct.initialBalance, false)}</span>
                        <span
                          className={`font-semibold ${
                            diffFromInitial >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {diffFromInitial >= 0 ? '+' : ''}
                          {formatINR(diffFromInitial, false)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purpose / Target Needed monthly matching Excel */}
                  <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                    <span>Target Needed:</span>
                    <span
                      className={`font-bold font-mono ${
                        acct.neededMonthly < 0 ? 'text-rose-400' : 'text-slate-200'
                      }`}
                    >
                      {formatINR(acct.neededMonthly, false)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CREDIT CARDS & SHARED POOLS TAB */}
      {/* ========================================================= */}
      {subTab === 'cards' && (
        <div className="space-y-5">
          {/* CC Overview Banner matching Excel figures (Limit ₹42,22,000, Liability ₹15,291) */}
          <div className="bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 border border-rose-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total CC Liabilities
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-rose-400 font-mono mt-0.5">
                  {formatINR(totalLiabilities)}
                </div>
                <span className="text-[10px] text-slate-400">Current unbilled & dues</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Credit Limits
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-0.5">
                  {formatCompactINR(totalLimits)}
                </div>
                <span className="text-[10px] text-slate-400">Combined limit across pools</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Available Credit
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  {formatCompactINR(totalAvailableLimit)}
                </div>
                <span className="text-[10px] text-slate-400">Safe spending room</span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Overall Utilization
                </span>
                <div className="text-xl sm:text-2xl font-extrabold text-sky-400 font-mono mt-0.5">
                  {formatPercent(overallUtilization)}
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold">Excellent (&lt;30%)</span>
              </div>
            </div>
          </div>

          {/* Section: Shared Credit Limit Pools */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Shared Limit Card Pools (Common Limit)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Multiple cards sharing one limit pool</span>
            </div>

            <div className="space-y-4">
              {pools.map((pool) => (
                <div
                  key={pool.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4"
                >
                  {/* Pool Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-white">{pool.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Shared Pool
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Shared Credit Limit:{' '}
                        <strong className="text-slate-200">{formatINR(pool.totalLimit, false)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-sans block">Total Dues</span>
                        <span className="font-bold text-rose-400">{formatINR(pool.currentPoolLiability)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-sans block">Remaining Limit</span>
                        <span className="font-bold text-emerald-400">{formatINR(pool.availablePoolLimit)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Pool Utilization</span>
                      <span className="font-bold text-slate-200 font-mono">
                        {formatPercent(pool.poolUtilization)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, pool.poolUtilization)}%` }}
                      />
                    </div>
                  </div>

                  {/* Cards inside this pool */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {pool.cards.map((card) => (
                      <div
                        key={card.id}
                        className="bg-slate-950/80 border border-slate-850 rounded-2xl p-3.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white truncate">{card.name}</span>
                            <span className="text-[9px] uppercase px-1 rounded bg-slate-800 text-slate-400">
                              {card.network || 'Card'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Liability:{' '}
                            <strong className="text-rose-400 font-mono">
                              {formatINR(card.currentLiability)}
                            </strong>
                          </div>
                        </div>

                        {card.currentLiability > 0 && (
                          <button
                            onClick={() => {
                              setPayingCard(card);
                              setPayAmountStr(card.currentLiability.toString());
                            }}
                            className="mt-3 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] transition"
                          >
                            Pay Dues
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Standalone Credit Cards */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Standalone Credit Cards
                </h3>
              </div>
              <span className="text-xs text-slate-400">Cards with dedicated credit limits</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {standaloneCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-4.5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-white">{card.name}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {card.network || 'CC'}
                      </span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-3 space-y-1.5 my-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Liability:</span>
                        <span className="font-bold text-rose-400 font-mono">
                          {formatINR(card.currentLiability)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Card Limit:</span>
                        <span className="font-bold text-white font-mono">
                          {formatINR(card.standaloneLimit || 0, false)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pt-1 border-t border-slate-850">
                        <span className="text-slate-400">Available:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatINR(card.effectiveAvailableLimit, false)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    {card.currentLiability > 0 && (
                      <button
                        onClick={() => {
                          setPayingCard(card);
                          setPayAmountStr(card.currentLiability.toString());
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold text-xs transition"
                      >
                        Pay Bill
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const newBilled = prompt('Enter last generated billed statement amount:', (card.billedAmount || 0).toString());
                        if (newBilled !== null) {
                          onUpdateCard({ ...card, billedAmount: parseFloat(newBilled) || 0 });
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      title="Update Billed Amount"
                    >
                      Set Billed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RECONCILE MODAL */}
      {reconcilingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Reconcile {reconcilingAccount.name} Balance</h3>
              <button
                onClick={() => setReconcilingAccount(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReconcileSubmit} className="mt-4 space-y-3.5 text-xs">
              <p className="text-slate-300">
                Enter the exact balance currently visible on your official netbanking or passbook:
              </p>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Official Bank Balance (INR)</label>
                <input
                  type="number"
                  step="any"
                  value={newReconcileBalanceStr}
                  onChange={(e) => setNewReconcileBalanceStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-white font-mono focus:border-emerald-500 outline-hidden font-bold"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReconcilingAccount(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save & Adjust
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAY CARD BILL MODAL */}
      {payingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Pay {payingCard.name} Bill</h3>
              <button
                onClick={() => setPayingCard(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePayCardSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Payment Amount (INR)</label>
                <input
                  type="number"
                  step="any"
                  value={payAmountStr}
                  onChange={(e) => setPayAmountStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-white font-mono focus:border-emerald-500 outline-hidden font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Pay From Bank Account</label>
                <select
                  value={payFromAccountId}
                  onChange={(e) => setPayFromAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Live: {formatINR(a.currentBalance, false)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayingCard(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ACCOUNT MODAL */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Add New Bank Account</h3>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Axis, Canara, ICICI..."
                  value={acctName}
                  onChange={(e) => setAcctName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Initial Balance (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={acctInitialBalanceStr}
                  onChange={(e) => setAcctInitialBalanceStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Purpose / Allocation Tag</label>
                <input
                  type="text"
                  placeholder="e.g. Salary, Rent, Investment, Daily Needs"
                  value={acctPurpose}
                  onChange={(e) => setAcctPurpose(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CREDIT CARD MODAL */}
      {isAddCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Add Credit Card</h3>
              <button
                onClick={() => setIsAddCardOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCardSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Card Name</label>
                <input
                  type="text"
                  placeholder="e.g. ICICI Sapphiro, Tata Neu..."
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Shared Pool (Optional)</label>
                <select
                  value={cardPoolId}
                  onChange={(e) => setCardPoolId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-rose-500 outline-hidden"
                >
                  <option value="">No Shared Pool (Standalone Limit)</option>
                  {pools.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Limit: {formatINR(p.totalLimit, false)})
                    </option>
                  ))}
                </select>
              </div>

              {!cardPoolId && (
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Credit Limit (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 300000"
                    value={cardLimitStr}
                    onChange={(e) => setCardLimitStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-rose-500 outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Current Liability (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={cardLiabilityStr}
                  onChange={(e) => setCardLiabilityStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCardOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
