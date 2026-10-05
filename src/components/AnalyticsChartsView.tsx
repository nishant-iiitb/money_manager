import React, { useState, useMemo } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
  Scale,
  Calendar,
  Layers,
  ArrowUpRight,
  Upload,
  Sparkles,
} from 'lucide-react';
import { Transaction, CustomCategory } from '../types/finance';
import {
  MonthlyInvestmentSnapshot,
  MonthlyExpenseVsInvestmentSnapshot,
} from '../types/historical';
import { formatINR, formatCompactINR, formatPercent } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { HistoricalChartsView } from './HistoricalChartsView';

interface AnalyticsChartsViewProps {
  transactions: Transaction[];
  categories: CustomCategory[];
  totalSavings: number;
  totalWallets: number;
  totalLiabilities: number;
  totalInvestments: number;
  netWorthSummary: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    totalNeeded: number;
    remainingCashflow: number;
    personalLendingAssets?: number;
    personalBorrowingLiabilities?: number;
  };
  historicalInvestments: MonthlyInvestmentSnapshot[];
  historicalExpenses: MonthlyExpenseVsInvestmentSnapshot[];
  onOpenBulkUpload: () => void;
}

export const AnalyticsChartsView: React.FC<AnalyticsChartsViewProps> = ({
  transactions,
  categories,
  totalSavings,
  totalWallets,
  totalLiabilities,
  totalInvestments,
  netWorthSummary,
  historicalInvestments,
  historicalExpenses,
  onOpenBulkUpload,
}) => {
  const [viewMode, setViewMode] = useState<'historical_charts' | 'current_month'>('historical_charts');

  // Available months dynamically extracted from transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    const currentM = new Date().toISOString().substring(0, 7);
    set.add(currentM);
    for (const tx of transactions) {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.substring(0, 7));
      }
    }
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState(() => availableMonths[0] || '2026-09');

  // Filter transactions by selected month (YYYY-MM)
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Spending by Category (Default + Custom)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let totalMonthSpent = 0;

    for (const tx of monthTransactions) {
      if (tx.type === 'expense') {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
        totalMonthSpent += tx.amount;
      }
    }

    const items = Object.entries(map).map(([name, amount]) => {
      const catMeta = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
      const percent = totalMonthSpent > 0 ? (amount / totalMonthSpent) * 100 : 0;
      return {
        name,
        amount,
        percent,
        color: catMeta?.color || '#94a3b8',
        iconName: catMeta?.iconName || 'Tag',
      };
    });

    items.sort((a, b) => b.amount - a.amount);

    return { items, totalMonthSpent };
  }, [monthTransactions, categories]);

  // Daily Spending distribution (Day 1 to 31)
  const dailySpending = useMemo(() => {
    const days: Record<number, number> = {};
    for (let i = 1; i <= 31; i++) days[i] = 0;

    for (const tx of monthTransactions) {
      if (tx.type === 'expense') {
        const parts = tx.date.split('-');
        if (parts.length === 3) {
          const day = parseInt(parts[2], 10);
          if (days[day] !== undefined) {
            days[day] += tx.amount;
          }
        }
      }
    }

    const list = Object.entries(days).map(([dayStr, amount]) => ({
      day: parseInt(dayStr, 10),
      amount,
    }));

    const maxDayAmount = Math.max(...list.map((d) => d.amount), 1000);

    return { list, maxDayAmount };
  }, [monthTransactions]);

  // SVG Donut Path calculations
  const donutArcs = useMemo(() => {
    let cumulativeAngle = 0;
    const radius = 70;
    const strokeWidth = 26;
    const circumference = 2 * Math.PI * radius;

    return categoryBreakdown.items.map((item) => {
      const strokeDasharray = `${(item.percent / 100) * circumference} ${circumference}`;
      const strokeDashoffset = -((cumulativeAngle / 100) * circumference);
      cumulativeAngle += item.percent;

      return {
        ...item,
        strokeDasharray,
        strokeDashoffset,
      };
    });
  }, [categoryBreakdown]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Navigation & Bulk Upload Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Analytics & Long-Term Trends</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            2-year visual trends (Dec-23 to Nov-25), portfolio growth, and monthly category drilldowns
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Bulk Upload Button */}
          <button
            onClick={onOpenBulkUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            title="Bulk Upload previous months or transactions"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Upload Data</span>
          </button>
        </div>
      </div>

      {/* Main View Mode Switcher */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
        <button
          onClick={() => setViewMode('historical_charts')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            viewMode === 'historical_charts'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Long-Term Excel Charts (Dec 2023 - Nov 2025)</span>
        </button>

        <button
          onClick={() => setViewMode('current_month')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            viewMode === 'current_month'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Monthly Drilldown & Balance Sheet</span>
        </button>
      </div>

      {/* VIEW 1: HISTORICAL CHARTS (Image 1, 2, 3) */}
      {viewMode === 'historical_charts' && (
        <HistoricalChartsView
          investments={historicalInvestments}
          expenses={historicalExpenses}
        />
      )}

      {/* VIEW 2: CURRENT MONTH DRILLDOWN & NET WORTH */}
      {viewMode === 'current_month' && (
        <div className="space-y-6">
          {/* Month Selector */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Select Inspection Month
            </span>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-white font-bold outline-hidden cursor-pointer"
              >
                {availableMonths.map((m) => {
                  const [y, mon] = m.split('-');
                  const monthName = new Date(parseInt(y), parseInt(mon) - 1, 1).toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  });
                  return (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {monthName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

      {/* ========================================================= */}
      {/* BALANCE SHEET & FINAL CALCULATION (User's Excel Sheet) */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">
              Balance Sheet & Net Worth Overview
            </h3>
          </div>
          <span className="text-xs text-slate-400">Real-time assets minus liabilities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Total Assets */}
          <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Total Assets</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatINR(netWorthSummary.totalAssets)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
              <div>Banks & Wallets: {formatINR(totalSavings + totalWallets, false)}</div>
              <div>Investments & RDs: {formatINR(totalInvestments, false)}</div>
              {netWorthSummary.personalLendingAssets !== undefined && netWorthSummary.personalLendingAssets > 0 && (
                <div className="text-emerald-300 font-medium">
                  P2P Lent (Receivables): {formatINR(netWorthSummary.personalLendingAssets, false)}
                </div>
              )}
            </div>
          </div>

          {/* Total Liabilities */}
          <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4 text-rose-400" />
              <span>Total Liabilities</span>
            </div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono">
              {formatINR(netWorthSummary.totalLiabilities)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
              <div>Credit Cards: {formatINR(totalLiabilities, false)}</div>
              {netWorthSummary.personalBorrowingLiabilities !== undefined && netWorthSummary.personalBorrowingLiabilities > 0 && (
                <div className="text-rose-300 font-medium">
                  P2P Borrowed (Debt): {formatINR(netWorthSummary.personalBorrowingLiabilities, false)}
                </div>
              )}
            </div>
          </div>

          {/* Net Worth */}
          <div className="bg-gradient-to-br from-emerald-950/30 to-slate-950 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              <span>Net Worth</span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono">
              {formatINR(netWorthSummary.netWorth)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1">
              Solvent & positive reserve
            </div>
          </div>
        </div>

        {/* Excel Final Calculation Summary Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Excel Cashflow Calculation
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <span className="text-slate-400 block">Total Savings Balance:</span>
              <span className="font-extrabold text-white font-mono">{formatINR(totalSavings)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Monthly Target Needed:</span>
              <span className="font-extrabold text-rose-400 font-mono">
                {formatINR(netWorthSummary.totalNeeded)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Month Spent:</span>
              <span className="font-extrabold text-amber-400 font-mono">
                {formatINR(categoryBreakdown.totalMonthSpent)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Remaining Cashflow:</span>
              <span className="font-extrabold text-sky-400 font-mono">
                {formatINR(netWorthSummary.remainingCashflow)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CATEGORY SPENDING DONUT CHART & BREAKDOWN */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-white text-base">Monthly Category Breakdown</h3>
            <p className="text-xs text-slate-400">
              Total Outflow: <strong className="text-white font-mono">{formatINR(categoryBreakdown.totalMonthSpent)}</strong>
            </p>
          </div>
          <span className="text-[11px] text-slate-400">{categoryBreakdown.items.length} Categories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* SVG Donut */}
          <div className="flex flex-col items-center justify-center relative py-4">
            <svg viewBox="0 0 200 200" className="w-52 h-52 -rotate-90 transform">
              {/* Background circle track */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="26"
              />
              {/* Colored Segments */}
              {donutArcs.map((arc, i) => (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke={arc.color}
                  strokeWidth="26"
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  className="transition-all duration-500 hover:opacity-85"
                />
              ))}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Spent</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-mono">
                {formatCompactINR(categoryBreakdown.totalMonthSpent)}
              </span>
            </div>
          </div>

          {/* Legend / Category List */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {categoryBreakdown.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-950/60 transition text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-white truncate">{item.name}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-slate-300 font-medium">
                    {formatINR(item.amount)}
                  </span>
                  <span className="font-mono font-bold text-slate-400 w-12 text-right">
                    {formatPercent(item.percent)}
                  </span>
                </div>
              </div>
            ))}

            {categoryBreakdown.items.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                No expenses logged for this month.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DAILY SPENDING BAR CHART */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-white text-base">Daily Spending Trend</h3>
            <p className="text-xs text-slate-400">Daily outflow spikes across the month</p>
          </div>
          <BarChart3 className="w-5 h-5 text-sky-400" />
        </div>

        {/* Bar chart grid */}
        <div className="pt-6 pb-2">
          <div className="flex items-end justify-between gap-1 h-36 border-b border-slate-800 pb-1">
            {dailySpending.list.map((d) => {
              const heightPercent = Math.max(4, Math.round((d.amount / dailySpending.maxDayAmount) * 100));
              const hasSpend = d.amount > 0;

              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center justify-end h-full group relative"
                >
                  {/* Tooltip on hover */}
                  {hasSpend && (
                    <div className="absolute -top-8 bg-slate-950 border border-slate-700 text-[10px] text-white px-1.5 py-0.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 font-mono">
                      Day {d.day}: {formatINR(d.amount, false)}
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t transition-all ${
                      hasSpend
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-400 hover:brightness-125'
                        : 'bg-slate-800/40'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 pt-1 font-mono">
            <span>Day 1</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Day 31</span>
          </div>
        </div>
      </div>
    </div>
    )}
  </div>
  );
};
