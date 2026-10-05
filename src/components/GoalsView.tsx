import React, { useState, useMemo } from 'react';
import {
  Target,
  Plus,
  Calendar,
  Sparkles,
  TrendingUp,
  Landmark,
  ArrowRight,
  ShieldCheck,
  Plane,
  Award,
  Trash2,
  Edit3,
  X,
  Check,
} from 'lucide-react';
import { FinancialGoal, Transaction } from '../types/finance';
import { CalculatedAccount } from '../hooks/useFinanceStore';
import { formatINR, formatCompactINR } from '../utils/formatters';

interface GoalsViewProps {
  goals: FinancialGoal[];
  accounts: CalculatedAccount[];
  transactions: Transaction[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
  onAllocateFunds: (goalId: string, amount: number, fromAccountId?: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  accounts,
  transactions,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onAllocateFunds,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [savedAmountStr, setSavedAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#10b981');

  // Allocate funds modal state
  const [allocatingGoalId, setAllocatingGoalId] = useState<string | null>(null);
  const [allocateAmountStr, setAllocateAmountStr] = useState('');
  const [allocateFromAccountId, setAllocateFromAccountId] = useState('');

  // Calculate user's monthly net savings rate (based on income vs expenses in transaction ledger)
  const monthlySavingsRate = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpense += tx.amount;
    }

    // Default healthy monthly savings estimate if user hasn't added monthly salary yet
    const net = totalIncome - totalExpense;
    return net > 0 ? net : 25000; // Realistic Indian savings rate baseline ~₹25,000/mo
  }, [transactions]);

  const handleOpenCreateModal = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmountStr('');
    setSavedAmountStr('0');
    // Default target date to 6 months from now
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    setTargetDate(sixMonthsLater.toISOString().split('T')[0]);
    setLinkedAccountId(accounts[0]?.id || '');
    setNotes('');
    setColor('#10b981');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmountStr(goal.targetAmount.toString());
    setSavedAmountStr(goal.savedAmount.toString());
    setTargetDate(goal.targetDate);
    setLinkedAccountId(goal.linkedAccountId || '');
    setNotes(goal.notes || '');
    setColor(goal.color);
    setIsModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(targetAmountStr);
    const savedAmount = parseFloat(savedAmountStr) || 0;

    if (!title.trim() || !targetAmount || isNaN(targetAmount)) {
      alert('Please provide a goal title and target amount');
      return;
    }

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        title: title.trim(),
        targetAmount,
        savedAmount,
        targetDate,
        linkedAccountId: linkedAccountId || undefined,
        notes: notes.trim(),
        color,
      });
    } else {
      onAddGoal({
        title: title.trim(),
        targetAmount,
        savedAmount,
        targetDate,
        linkedAccountId: linkedAccountId || undefined,
        notes: notes.trim(),
        color,
      });
    }

    setIsModalOpen(false);
  };

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocateAmountStr);
    if (!allocatingGoalId || !amount || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    onAllocateFunds(allocatingGoalId, amount, allocateFromAccountId || undefined);
    setAllocatingGoalId(null);
    setAllocateAmountStr('');
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Financial Goals & Savings</h2>
            <p className="text-xs text-slate-400">
              Track milestone targets, linked bank accounts & projected completion dates
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Financial Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
          const remainingAmount = Math.max(0, goal.targetAmount - goal.savedAmount);
          const linkedAccount = accounts.find((a) => a.id === goal.linkedAccountId);

          // Calculate estimated completion date:
          // Remaining needed / monthly savings pace = months left
          const monthsNeeded = monthlySavingsRate > 0 ? remainingAmount / monthlySavingsRate : 0;
          const estimatedDate = new Date();
          estimatedDate.setDate(estimatedDate.getDate() + Math.round(monthsNeeded * 30.5));
          const formattedEstDate = estimatedDate.toLocaleDateString('en-IN', {
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={goal.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
            >
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
                      style={{ backgroundColor: `${goal.color}25`, color: goal.color }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{goal.title}</h3>
                      {goal.notes && <p className="text-xs text-slate-400 line-clamp-1">{goal.notes}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete goal "${goal.title}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 my-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Saved: {formatINR(goal.savedAmount, false)}</span>
                    <span className="font-extrabold text-white font-mono">{progressPercent}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: goal.color || '#10b981',
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Target: {formatINR(goal.targetAmount, false)}</span>
                    <span className="text-emerald-400 font-medium">
                      Needed: {formatINR(remainingAmount, false)}
                    </span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/70 border border-slate-850 rounded-2xl text-xs mb-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Target Date
                    </div>
                    <div className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{goal.targetDate || 'Flexible'}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Est. Completion
                    </div>
                    <div className="font-medium text-emerald-400 mt-0.5 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>{remainingAmount === 0 ? 'Achieved!' : formattedEstDate}</span>
                    </div>
                  </div>

                  {linkedAccount && (
                    <div className="col-span-2 pt-2 border-t border-slate-850 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-sky-400" />
                        Linked Account:
                      </span>
                      <span className="font-semibold text-sky-300">
                        {linkedAccount.name} ({formatINR(linkedAccount.currentBalance, false)})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => {
                  setAllocatingGoalId(goal.id);
                  setAllocateAmountStr('5000');
                  setAllocateFromAccountId(goal.linkedAccountId || accounts[0]?.id || '');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add / Allocate Funds to Goal</span>
              </button>
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-white text-base">No Goals Defined Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Set up milestone targets like Vacation, Emergency Fund, or Vehicle Down Payment to track savings progress.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">
                {editingGoal ? 'Edit Financial Goal' : 'Create New Financial Goal'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. Save for a Vacation, Emergency Fund, New Car"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-hidden"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Target Amount (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 100000"
                    value={targetAmountStr}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Initial Saved (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={savedAmountStr}
                    onChange={(e) => setSavedAmountStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Linked Account</label>
                  <select
                    value={linkedAccountId}
                    onChange={(e) => setLinkedAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                  >
                    <option value="">None / General</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.purpose})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Notes / Purpose</label>
                <input
                  type="text"
                  placeholder="Optional notes or itinerary..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ALLOCATE FUNDS MODAL */}
      {allocatingGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Allocate Funds to Goal</h3>
              <button
                onClick={() => setAllocatingGoalId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Amount to Add (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={allocateAmountStr}
                  onChange={(e) => setAllocateAmountStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-white font-mono focus:border-emerald-500 outline-hidden font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">
                  Transfer From Bank Account (Optional)
                </label>
                <select
                  value={allocateFromAccountId}
                  onChange={(e) => setAllocateFromAccountId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                >
                  <option value="">Do not deduct from bank balance</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({formatINR(a.currentBalance, false)})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Selecting an account will record a transfer and deduct from its live balance.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAllocatingGoalId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
