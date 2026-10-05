import React, { useState } from 'react';
import {
  CalendarClock,
  ShieldCheck,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  RecurringCommitment,
  MonthlyHouseholdBudget,
  InvestmentEntry,
} from '../types/finance';
import { formatINR } from '../utils/formatters';

interface CommitmentsBudgetViewProps {
  commitments: RecurringCommitment[];
  householdBudgets: MonthlyHouseholdBudget[];
  investments: InvestmentEntry[];
  onAddCommitment: (commitment: Omit<RecurringCommitment, 'id'>) => void;
  onUpdateCommitment: (commitment: RecurringCommitment) => void;
  onDeleteCommitment: (id: string) => void;
  onUpdateHouseholdBudget: (id: string, actual: number, planned: number) => void;
  onAddHouseholdBudget: (budget: Omit<MonthlyHouseholdBudget, 'id'>) => void;
  onUpdateInvestment: (id: string, current: number, proposed: number) => void;
  onAddInvestment: (inv: Omit<InvestmentEntry, 'id'>) => void;
}

export const CommitmentsBudgetView: React.FC<CommitmentsBudgetViewProps> = ({
  commitments,
  householdBudgets,
  investments,
  onAddCommitment,
  onUpdateCommitment,
  onDeleteCommitment,
  onUpdateHouseholdBudget,
  onAddHouseholdBudget,
  onUpdateInvestment,
  onAddInvestment,
}) => {
  const [activeSection, setActiveSection] = useState<'commitments' | 'household' | 'investments'>('household');

  // Add commitment state
  const [isAddCommitmentOpen, setIsAddCommitmentOpen] = useState(false);
  const [comName, setComName] = useState('');
  const [comCategory, setComCategory] = useState<RecurringCommitment['category']>('insurance');
  const [comAmountStr, setComAmountStr] = useState('');
  const [comFrequency, setComFrequency] = useState<RecurringCommitment['frequency']>('Monthly');
  const [comRemarks, setComRemarks] = useState('');

  // Add Household state
  const [isAddHouseholdOpen, setIsAddHouseholdOpen] = useState(false);
  const [hbName, setHbName] = useState('');
  const [hbActualStr, setHbActualStr] = useState('');
  const [hbPlannedStr, setHbPlannedStr] = useState('');
  const [hbNotes, setHbNotes] = useState('');

  // Monthly active insurance sum
  const monthlyActiveCommitmentsTotal = commitments
    .filter((c) => c.active && c.frequency === 'Monthly')
    .reduce((sum, c) => sum + c.amount, 0);

  // Total household planned vs actual
  const totalHouseholdActual = householdBudgets.reduce((sum, h) => sum + (h.actualAmount || 0), 0);
  const totalHouseholdPlanned = householdBudgets.reduce((sum, h) => sum + (h.plannedAmount || 0), 0);

  // Total investments
  const totalInvestmentCurrent = investments.reduce((sum, i) => sum + (i.currentAmount || 0), 0);

  const handleAddCommitmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(comAmountStr);
    if (!comName.trim() || !amount || isNaN(amount)) {
      alert('Please enter name and valid amount');
      return;
    }

    onAddCommitment({
      name: comName.trim(),
      category: comCategory,
      amount,
      frequency: comFrequency,
      dueMonthRemark: comRemarks.trim() || comFrequency,
      active: true,
    });

    setIsAddCommitmentOpen(false);
    setComName('');
    setComAmountStr('');
    setComRemarks('');
  };

  const handleAddHouseholdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hbName.trim()) {
      alert('Please enter budget name');
      return;
    }

    onAddHouseholdBudget({
      name: hbName.trim(),
      category: 'Home',
      actualAmount: parseFloat(hbActualStr) || 0,
      plannedAmount: parseFloat(hbPlannedStr) || 0,
      notes: hbNotes.trim(),
    });

    setIsAddHouseholdOpen(false);
    setHbName('');
    setHbActualStr('');
    setHbPlannedStr('');
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSection('household')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeSection === 'household'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CalendarClock className="w-4 h-4" />
          <span>Monthly Household Budget</span>
        </button>

        <button
          onClick={() => setActiveSection('commitments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeSection === 'commitments'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Insurance & EMIs</span>
        </button>

        <button
          onClick={() => setActiveSection('investments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            activeSection === 'investments'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Investments & RDs</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: MONTHLY HOUSEHOLD BUDGET (PLANNED VS ACTUAL) */}
      {/* ========================================================= */}
      {activeSection === 'household' && (
        <div className="space-y-4">
          {/* Summary Overview */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Recurring Monthly Household Budget
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
                  {formatINR(totalHouseholdActual)}
                </span>
                <span className="text-xs text-slate-400">
                  Planned: <strong className="text-white font-mono">{formatINR(totalHouseholdPlanned)}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rent, society maintenance, maid, groceries & utilities tracking
              </p>
            </div>

            <button
              onClick={() => setIsAddHouseholdOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Budget Item</span>
            </button>
          </div>

          {/* Household Budget Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {householdBudgets.map((item) => {
              const diff = item.plannedAmount - item.actualAmount;
              const percentUsed = item.plannedAmount > 0
                ? Math.min(100, Math.round((item.actualAmount / item.plannedAmount) * 100))
                : 0;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{item.name}</h4>
                        {item.notes && <p className="text-[11px] text-slate-400 mt-0.5">{item.notes}</p>}
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {item.category || 'Household'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">
                          Actual: <strong className="text-emerald-400 font-mono">{formatINR(item.actualAmount)}</strong>
                        </span>
                        <span className="text-slate-400">
                          Planned: <strong className="text-white font-mono">{formatINR(item.plannedAmount)}</strong>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentUsed > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                    <span className="text-slate-400">
                      Variance: <strong className={diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {diff >= 0 ? `+${formatINR(diff, false)} surplus` : `${formatINR(diff, false)} over`}
                      </strong>
                    </span>

                    <button
                      onClick={() => {
                        const newAct = prompt(`Enter actual spent for ${item.name}:`, item.actualAmount.toString());
                        const newPlan = prompt(`Enter planned budget for ${item.name}:`, item.plannedAmount.toString());
                        if (newAct !== null && newPlan !== null) {
                          onUpdateHouseholdBudget(item.id, parseFloat(newAct) || 0, parseFloat(newPlan) || 0);
                        }
                      }}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                    >
                      Update Figures
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: INSURANCE & EMIs */}
      {/* ========================================================= */}
      {activeSection === 'commitments' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Recurring Term & Health Insurances / EMIs
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono mt-0.5">
                {formatINR(monthlyActiveCommitmentsTotal)}
                <span className="text-xs font-normal text-slate-400 ml-1">/ month active</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tracks monthly mandates and yearly lump-sum policies (LIC, Niva Bupa, HDFC Life)
              </p>
            </div>

            <button
              onClick={() => setIsAddCommitmentOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Insurance Policy</span>
            </button>
          </div>

          {/* List of Commitments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {commitments.map((com) => (
              <div
                key={com.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-white">{com.name}</h4>
                      <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 inline-block mt-1">
                        {com.dueMonthRemark || com.frequency}
                      </span>
                    </div>

                    <button
                      onClick={() => onUpdateCommitment({ ...com, active: !com.active })}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                        com.active
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {com.active ? 'Active' : 'Paused'}
                    </button>
                  </div>

                  <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-3 my-2">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Premium Amount</span>
                    <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                      {formatINR(com.amount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
                  <span className="text-slate-400 capitalize">{com.frequency}</span>
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${com.name}" from tracker?`)) {
                        onDeleteCommitment(com.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: INVESTMENTS & RDs */}
      {/* ========================================================= */}
      {activeSection === 'investments' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-sky-500/30 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Tracked Active Investments
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-sky-400 font-mono mt-0.5">
                {formatINR(totalInvestmentCurrent)}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                RD Insurance, Mutual Funds, Zerodha Stocks, NPS & PPF
              </p>
            </div>
          </div>

          {/* Investment list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {investments.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4.5 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-extrabold text-sm text-white">{inv.name}</h4>
                  {inv.remarks && <p className="text-[11px] text-slate-400 mt-0.5">{inv.remarks}</p>}

                  <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-3 my-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Current Amount:</span>
                      <span className="font-bold text-sky-400 font-mono">{formatINR(inv.currentAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-slate-400">Proposed Target:</span>
                      <span className="font-bold text-slate-300 font-mono">{formatINR(inv.proposedAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 flex justify-end">
                  <button
                    onClick={() => {
                      const cur = prompt(`Enter current amount for ${inv.name}:`, inv.currentAmount.toString());
                      const prop = prompt(`Enter proposed monthly target for ${inv.name}:`, inv.proposedAmount.toString());
                      if (cur !== null && prop !== null) {
                        onUpdateInvestment(inv.id, parseFloat(cur) || 0, parseFloat(prop) || 0);
                      }
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    Edit Figures
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD COMMITMENT MODAL */}
      {isAddCommitmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Add Recurring Commitment</h3>
              <button
                onClick={() => setIsAddCommitmentOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCommitmentSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Policy / Loan / Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Max Life Term 1, Car EMI, Netflix..."
                  value={comName}
                  onChange={(e) => setComName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Premium / Installment Amount (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 1056"
                  value={comAmountStr}
                  onChange={(e) => setComAmountStr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-purple-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Type</label>
                  <select
                    value={comCategory}
                    onChange={(e) => setComCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-hidden"
                  >
                    <option value="insurance">Insurance</option>
                    <option value="emi">EMI / Loan</option>
                    <option value="subscription">Subscription</option>
                    <option value="rd">RD</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Frequency</label>
                  <select
                    value={comFrequency}
                    onChange={(e) => setComFrequency(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-hidden"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half Yearly">Half Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Due Date / Months Remark</label>
                <input
                  type="text"
                  placeholder="e.g. Yearly (Sep), Half Yearly (Feb, Aug)..."
                  value={comRemarks}
                  onChange={(e) => setComRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-purple-500 outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCommitmentOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Add Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HOUSEHOLD BUDGET ITEM MODAL */}
      {isAddHouseholdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base">Add Household Budget Item</h3>
              <button
                onClick={() => setIsAddHouseholdOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddHouseholdSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Expense Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rent, Electricity, Maid, Internet..."
                  value={hbName}
                  onChange={(e) => setHbName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Actual Spent (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={hbActualStr}
                    onChange={(e) => setHbActualStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Planned Budget (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7500"
                    value={hbPlannedStr}
                    onChange={(e) => setHbPlannedStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Due on 5th of each month"
                  value={hbNotes}
                  onChange={(e) => setHbNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddHouseholdOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
