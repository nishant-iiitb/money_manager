import React, { useState, useMemo } from 'react';
import {
  Users,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  Wallet,
  Landmark,
  Trash2,
  Edit2,
  X,
  Check,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  PersonLendingRecord,
  PersonTransactionType,
  BankAccount,
} from '../types/finance';
import { formatINR, formatCompactINR } from '../utils/formatters';

interface PersonLendingViewProps {
  records: PersonLendingRecord[];
  accounts: BankAccount[];
  onAddRecord: (
    record: Omit<
      PersonLendingRecord,
      'id' | 'createdAt' | 'remainingAmount' | 'settled' | 'settlements'
    > & { logToBank?: boolean }
  ) => void;
  onRecordSettlement: (
    recordId: string,
    settlement: {
      amount: number;
      date: string;
      notes?: string;
      accountId?: string;
      logToBank?: boolean;
    }
  ) => void;
  onUpdateRecord: (id: string, updates: Partial<PersonLendingRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

export const PersonLendingView: React.FC<PersonLendingViewProps> = ({
  records,
  accounts,
  onAddRecord,
  onRecordSettlement,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'lent' | 'borrowed' | 'pending' | 'settled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settleTargetRecord, setSettleTargetRecord] = useState<PersonLendingRecord | null>(null);

  // New Record Form State
  const [newPersonName, setNewPersonName] = useState('');
  const [newType, setNewType] = useState<PersonTransactionType>('lent');
  const [newAmount, setNewAmount] = useState('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newDueDate, setNewDueDate] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAccountId, setNewAccountId] = useState(accounts[0]?.id || '');
  const [newLogToBank, setNewLogToBank] = useState(false);

  // Settlement Form State
  const [settleAmount, setSettleAmount] = useState('');
  const [settleDate, setSettleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [settleNotes, setSettleNotes] = useState('');
  const [settleAccountId, setSettleAccountId] = useState(accounts[0]?.id || '');
  const [settleLogToBank, setSettleLogToBank] = useState(true);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalLentPending = 0;
    let totalBorrowedPending = 0;
    let totalLentOriginal = 0;
    let totalBorrowedOriginal = 0;
    let activeCount = 0;
    let settledCount = 0;

    for (const r of records) {
      if (r.type === 'lent') {
        totalLentOriginal += r.originalAmount;
        if (!r.settled) {
          totalLentPending += r.remainingAmount;
          activeCount++;
        } else {
          settledCount++;
        }
      } else {
        totalBorrowedOriginal += r.originalAmount;
        if (!r.settled) {
          totalBorrowedPending += r.remainingAmount;
          activeCount++;
        } else {
          settledCount++;
        }
      }
    }

    const netBalance = totalLentPending - totalBorrowedPending;

    return {
      totalLentPending,
      totalBorrowedPending,
      totalLentOriginal,
      totalBorrowedOriginal,
      netBalance,
      activeCount,
      settledCount,
      totalRecords: records.length,
    };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Type filter
      if (filterType === 'lent' && r.type !== 'lent') return false;
      if (filterType === 'borrowed' && r.type !== 'borrowed') return false;
      if (filterType === 'pending' && r.settled) return false;
      if (filterType === 'settled' && !r.settled) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = r.personName.toLowerCase().includes(q);
        const matchesNotes = (r.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesNotes) return false;
      }

      return true;
    });
  }, [records, filterType, searchQuery]);

  const handleOpenAddModal = (presetType: PersonTransactionType = 'lent') => {
    setNewType(presetType);
    setNewPersonName('');
    setNewAmount('');
    setNewDueDate('');
    setNewNotes('');
    setNewLogToBank(false);
    setIsAddModalOpen(true);
  };

  const handleSaveNewRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newAmount);
    if (!newPersonName.trim() || isNaN(amt) || amt <= 0) return;

    onAddRecord({
      personName: newPersonName.trim(),
      type: newType,
      originalAmount: amt,
      date: newDate,
      dueDate: newDueDate || undefined,
      notes: newNotes.trim() || undefined,
      accountId: newAccountId || undefined,
      logToBank: newLogToBank,
    });

    setIsAddModalOpen(false);
  };

  const handleOpenSettleModal = (record: PersonLendingRecord) => {
    setSettleTargetRecord(record);
    setSettleAmount(String(record.remainingAmount));
    setSettleDate(new Date().toISOString().split('T')[0]);
    setSettleNotes('');
    setSettleLogToBank(true);
  };

  const handleSaveSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleTargetRecord) return;
    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) return;

    onRecordSettlement(settleTargetRecord.id, {
      amount: Math.min(amt, settleTargetRecord.remainingAmount),
      date: settleDate,
      notes: settleNotes.trim() || undefined,
      accountId: settleAccountId || undefined,
      logToBank: settleLogToBank,
    });

    setSettleTargetRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                P2P Borrow & Lending Tracker
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Track personal loans, friends split receivables (Assets) & borrowed debt (Liabilities).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal('lent')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition active:scale-95"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ I Lent Money (Asset)</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('borrowed')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-950/40 transition active:scale-95"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ I Borrowed (Liability)</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          {/* Lent / Assets Card */}
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Money Lent (Receivables)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                Asset
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-300">
              {formatINR(metrics.totalLentPending)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Original: {formatCompactINR(metrics.totalLentOriginal)}</span>
              <span>People owe you</span>
            </div>
          </div>

          {/* Borrowed / Liabilities Card */}
          <div className="bg-slate-950/60 border border-rose-500/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-rose-400 font-semibold mb-1">
              <span className="flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Money Borrowed (Payables)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30">
                Liability
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-300">
              {formatINR(metrics.totalBorrowedPending)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Original: {formatCompactINR(metrics.totalBorrowedOriginal)}</span>
              <span>You owe others</span>
            </div>
          </div>

          {/* Net Position Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Net P2P Position</span>
              <span className="text-[10px] text-slate-500">
                {metrics.activeCount} active • {metrics.settledCount} settled
              </span>
            </div>
            <div
              className={`text-2xl font-extrabold font-mono ${
                metrics.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {metrics.netBalance >= 0 ? '+' : ''}
              {formatINR(metrics.netBalance)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {metrics.netBalance >= 0 ? 'Net positive (people owe you more)' : 'Net debt position'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: `All (${records.length})` },
              { id: 'lent', label: `Lent (Assets)` },
              { id: 'borrowed', label: `Borrowed (Debt)` },
              { id: 'pending', label: `Pending (${metrics.activeCount})` },
              { id: 'settled', label: `Settled (${metrics.settledCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search person or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base">No P2P Records Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {records.length === 0
                ? 'Your personal borrow & lending ledger is completely clean at 0. Record any money lent or borrowed to keep your asset/liability balance up to date.'
                : 'No records match your active search or filter.'}
            </p>
          </div>
          {records.length === 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => handleOpenAddModal('lent')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                + Record Money Lent (Asset)
              </button>
              <button
                onClick={() => handleOpenAddModal('borrowed')}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
              >
                + Record Money Borrowed (Debt)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRecords.map((record) => {
            const isLent = record.type === 'lent';
            const progress =
              record.originalAmount > 0
                ? ((record.originalAmount - record.remainingAmount) / record.originalAmount) * 100
                : 0;

            const isOverdue =
              !record.settled &&
              record.dueDate &&
              new Date(record.dueDate).getTime() < Date.now();

            return (
              <div
                key={record.id}
                className={`bg-slate-900 border rounded-3xl p-5 shadow-lg flex flex-col justify-between transition hover:border-slate-700 ${
                  record.settled
                    ? 'border-slate-800/60 opacity-80'
                    : isLent
                    ? 'border-emerald-500/20'
                    : 'border-rose-500/20'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          isLent
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                        }`}
                      >
                        {record.personName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-tight">
                          {record.personName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>Given: {record.date}</span>
                          {record.dueDate && (
                            <>
                              <span>•</span>
                              <span
                                className={
                                  isOverdue
                                    ? 'text-rose-400 font-bold flex items-center gap-0.5'
                                    : 'text-slate-400'
                                }
                              >
                                {isOverdue && <AlertCircle className="w-2.5 h-2.5" />}
                                Due: {record.dueDate}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                          record.settled
                            ? 'bg-slate-800 text-slate-400 border-slate-700'
                            : isLent
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {record.settled
                          ? 'Settled'
                          : isLent
                          ? 'Receivable (Asset)'
                          : 'Payable (Liability)'}
                      </span>

                      <div className="text-right mt-1.5">
                        <div
                          className={`font-mono font-extrabold text-lg ${
                            record.settled
                              ? 'text-slate-400 line-through'
                              : isLent
                              ? 'text-emerald-300'
                              : 'text-rose-300'
                          }`}
                        >
                          {formatINR(record.remainingAmount)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          of {formatINR(record.originalAmount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Account tags */}
                  {record.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 mt-3 italic">
                      "{record.notes}"
                    </p>
                  )}

                  {/* Settlement Progress */}
                  <div className="mt-3.5 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Repayment Progress</span>
                      <span className="font-mono">{progress.toFixed(0)}% Settled</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLent ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Settlement History Logs if any */}
                  {record.settlements && record.settlements.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Settlement History ({record.settlements.length})
                      </span>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-xs">
                        {record.settlements.map((s) => (
                          <div
                            key={s.id}
                            className="bg-slate-950/80 border border-slate-850 rounded-xl p-1.5 px-2 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-slate-300 truncate">
                              {s.date} {s.notes ? `• ${s.notes}` : ''}
                            </span>
                            <span className="font-mono font-bold text-emerald-400 shrink-0">
                              +{formatINR(s.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between border-t border-slate-800/70 pt-3.5 mt-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDeleteRecord(record.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!record.settled ? (
                    <button
                      onClick={() => handleOpenSettleModal(record)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 border border-slate-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Record Payment</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Fully Repaid
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Add New P2P Record */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    newType === 'lent'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    {newType === 'lent' ? 'Record Money Lent' : 'Record Money Borrowed'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {newType === 'lent'
                      ? 'You gave money to someone (Asset / Receivable)'
                      : 'You received money from someone (Liability / Debt)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewType('lent')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    newType === 'lent'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>I Lent (Asset)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('borrowed')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    newType === 'borrowed'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>I Borrowed (Liability)</span>
                </button>
              </div>

              {/* Person Name */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Person Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma, Colleague, Landlord"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="0.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-600 outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Due Date & Bank Account */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Expected Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-hidden focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Associated Bank Account
                  </label>
                  <select
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-hidden focus:border-indigo-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.purpose})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Reason / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Trip expenses advance, Emergency loan, Laptop purchase"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Checkbox: Log to Bank Account */}
              <label className="flex items-center gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={newLogToBank}
                  onChange={(e) => setNewLogToBank(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs text-slate-300">
                  Also deduct/add this amount in {accounts.find((a) => a.id === newAccountId)?.name || 'bank'} ledger immediately
                </span>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-xs text-white shadow-md transition ${
                    newType === 'lent'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: Record Settlement / Repayment */}
      {/* ========================================================================= */}
      {settleTargetRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Record Settlement</h3>
                  <p className="text-xs text-slate-400">
                    {settleTargetRecord.type === 'lent'
                      ? `Received payment from ${settleTargetRecord.personName}`
                      : `Repaid money to ${settleTargetRecord.personName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettleTargetRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettlement} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Pending Amount</span>
                  <div className="text-lg font-extrabold font-mono text-white">
                    {formatINR(settleTargetRecord.remainingAmount)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettleAmount(String(settleTargetRecord.remainingAmount))}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
                >
                  Settle Full
                </button>
              </div>

              {/* Settlement Amount */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Settlement Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={settleTargetRecord.remainingAmount}
                  min="1"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Date & Bank Account */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={settleDate}
                    onChange={(e) => setSettleDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Bank Account
                  </label>
                  <select
                    value={settleAccountId}
                    onChange={(e) => setSettleAccountId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-hidden focus:border-emerald-500"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via UPI / GPay"
                  value={settleNotes}
                  onChange={(e) => setSettleNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Checkbox: Log to Bank Account */}
              <label className="flex items-center gap-2 p-3 bg-slate-950/70 border border-slate-800 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={settleLogToBank}
                  onChange={(e) => setSettleLogToBank(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span className="text-xs text-slate-300">
                  {settleTargetRecord.type === 'lent'
                    ? `Add money to ${accounts.find((a) => a.id === settleAccountId)?.name || 'bank'} balance`
                    : `Deduct money from ${accounts.find((a) => a.id === settleAccountId)?.name || 'bank'} balance`}
                </span>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSettleTargetRecord(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
