import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Table as TableIcon,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Upload,
} from 'lucide-react';
import {
  MonthlyInvestmentSnapshot,
  MonthlyExpenseVsInvestmentSnapshot,
} from '../types/historical';
import {
  ZERO_INVESTMENT_SNAPSHOTS,
  ZERO_EXPENSE_SNAPSHOTS,
} from '../data/historicalData';
import { formatINR } from '../utils/formatters';

interface HistoricalChartsViewProps {
  investments: MonthlyInvestmentSnapshot[];
  expenses: MonthlyExpenseVsInvestmentSnapshot[];
  onOpenBulkUpload?: () => void;
  onResetChartsToZero?: () => void;
  onLoadDemoCharts?: () => void;
}

export const HistoricalChartsView: React.FC<HistoricalChartsViewProps> = ({
  investments,
  expenses,
  onOpenBulkUpload,
  onResetChartsToZero,
  onLoadDemoCharts,
}) => {
  const [activeChart, setActiveChart] = useState<'investment' | 'expense' | 'expense_vs_investment'>('investment');

  // Fallback to ZERO snapshots if empty, ensuring charts always render with pristine ₹0.00 state
  const effectiveInvestments = useMemo(() => {
    return Array.isArray(investments) && investments.length > 0
      ? investments
      : ZERO_INVESTMENT_SNAPSHOTS;
  }, [investments]);

  const effectiveExpenses = useMemo(() => {
    return Array.isArray(expenses) && expenses.length > 0
      ? expenses
      : ZERO_EXPENSE_SNAPSHOTS;
  }, [expenses]);

  const isInvestmentsAllZero = useMemo(() => {
    return effectiveInvestments.every((inv) => (inv.total || 0) === 0);
  }, [effectiveInvestments]);

  const isExpensesAllZero = useMemo(() => {
    return effectiveExpenses.every((exp) => (exp.totalExpense || 0) === 0);
  }, [effectiveExpenses]);

  return (
    <div className="space-y-6">
      {/* Chart Selector & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto no-scrollbar flex-1">
          <button
            onClick={() => setActiveChart('investment')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeChart === 'investment'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>1. Investment Portfolio</span>
          </button>

          <button
            onClick={() => setActiveChart('expense')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeChart === 'expense'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>2. Expense Trend</span>
          </button>

          <button
            onClick={() => setActiveChart('expense_vs_investment')}
            className={`flex-1 min-w-[160px] py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeChart === 'expense_vs_investment'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Expense vs Investment</span>
          </button>
        </div>

        {/* Quick Action Reset & Preload */}
        <div className="flex items-center gap-1.5 self-end sm:self-center">
          {onResetChartsToZero && (
            <button
              onClick={onResetChartsToZero}
              className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Reset all charts to 0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset to 0</span>
            </button>
          )}

          {onLoadDemoCharts && (
            <button
              onClick={onLoadDemoCharts}
              className="px-3 py-2 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Load demo Excel figures"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Load Sample</span>
            </button>
          )}

          {onOpenBulkUpload && (
            <button
              onClick={onOpenBulkUpload}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
              title="Bulk upload previous months"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bulk CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Zero State Status Pill */}
      {(activeChart === 'investment' ? isInvestmentsAllZero : isExpensesAllZero) && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Chart clean slate: All values are currently set to <strong>₹0.00</strong>.</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Upload CSV or log expenses to populate bars.
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. INVESTMENT CHART (Sep-24 to Nov-25) matching Image 1 */}
      {/* ========================================================================= */}
      {activeChart === 'investment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">Investment</h3>
              <p className="text-xs text-slate-400">
                Portfolio growth across PPF, EPFO, NPS, Equity, ETF, MF, US Equity & FDs with % MoM change
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Latest Portfolio: <strong className="text-emerald-400 font-bold">{formatINR(effectiveInvestments[effectiveInvestments.length - 1]?.total || 0)}</strong>
              </span>
            </div>
          </div>

          {/* SVG Canvas Chart */}
          <div className="relative pt-2">
            <div className="overflow-x-auto pb-4">
              <svg viewBox="0 0 1100 360" className="w-full min-w-[900px] h-80 font-sans">
                {/* Horizontal Gridlines (0 to 7,00,000) */}
                {[0, 100000, 200000, 300000, 400000, 500000, 600000, 700000].map((val) => {
                  const y = 300 - (val / 700000) * 260;
                  return (
                    <g key={val}>
                      <line x1="80" y1={y} x2="1020" y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                      <text x="70" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                        ₹ {val.toLocaleString('en-IN')}.00
                      </text>
                    </g>
                  );
                })}

                {/* Right Y-Axis: Change % (-20% to +20%) */}
                {[-20, -15, -10, -5, 0, 5, 10, 15, 20].map((pct) => {
                  const y = 300 - ((pct + 20) / 40) * 260;
                  return (
                    <text key={pct} x="1030" y={y + 3} textAnchor="start" fill="#60a5fa" fontSize="9" fontFamily="monospace">
                      {pct}%
                    </text>
                  );
                })}

                {/* Bars & Line Points */}
                {effectiveInvestments.map((inv, idx) => {
                  const x = 110 + idx * 60;
                  const barWidth = 4.5;

                  const hPPF = (inv.ppf / 700000) * 260;
                  const hEPFO = (inv.epfo / 700000) * 260;
                  const hNPS = (inv.nps / 700000) * 260;
                  const hEq = (inv.equity / 700000) * 260;
                  const hETF = (inv.etf / 700000) * 260;
                  const hMF = (inv.mf / 700000) * 260;
                  const hUS = (inv.usEquity / 700000) * 260;
                  const hFD = (inv.fds / 700000) * 260;

                  return (
                    <g key={inv.month}>
                      <rect x={x - 18} y={300 - hPPF} width={barWidth} height={Math.max(0, hPPF)} fill="#60a5fa" rx="1" />
                      <rect x={x - 13} y={300 - hEPFO} width={barWidth} height={Math.max(0, hEPFO)} fill="#fb923c" rx="1" />
                      <rect x={x - 8} y={300 - hNPS} width={barWidth} height={Math.max(0, hNPS)} fill="#94a3b8" rx="1" />
                      <rect x={x - 3} y={300 - hEq} width={barWidth} height={Math.max(0, hEq)} fill="#facc15" rx="1" />
                      <rect x={x + 2} y={300 - hETF} width={barWidth} height={Math.max(0, hETF)} fill="#38bdf8" rx="1" />
                      <rect x={x + 7} y={300 - hMF} width={barWidth} height={Math.max(0, hMF)} fill="#4ade80" rx="1" />
                      <rect x={x + 12} y={300 - hUS} width={barWidth} height={Math.max(0, hUS)} fill="#4338ca" rx="1" />
                      <rect x={x + 17} y={300 - hFD} width={barWidth} height={Math.max(0, hFD)} fill="#b45309" rx="1" />

                      {/* X Axis Label */}
                      <text x={x} y="320" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                        {inv.month}
                      </text>
                    </g>
                  );
                })}

                {/* Change % Line Overlay */}
                {(() => {
                  const points = effectiveInvestments.map((inv, idx) => {
                    const pct = inv.changePercent ?? 0;
                    const x = 110 + idx * 60;
                    const y = 300 - ((pct + 20) / 40) * 260;
                    return { x, y, inv, pct };
                  });

                  if (points.length < 2) return null;
                  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                  return (
                    <g>
                      <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                      {points.map((p, i) => (
                        <g key={i}>
                          <circle cx={p.x} cy={p.y} r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                          <text
                            x={p.x}
                            y={p.y - 7}
                            textAnchor="middle"
                            fill="#93c5fd"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {p.pct}%
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Legend matching Screenshot 1 */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs border-t border-slate-800">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-xs" /> PPF</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-400 rounded-xs" /> EPFO</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-400 rounded-xs" /> NPS</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-xs" /> Equity</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-sky-400 rounded-xs" /> ETF</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400 rounded-xs" /> MF</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-700 rounded-xs" /> US Equity</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-700 rounded-xs" /> FDs</span>
              <span className="flex items-center gap-1.5 font-bold"><span className="w-4 h-0.5 bg-blue-600" /> Change%</span>
            </div>
          </div>

          {/* Interactive Data Grid Table matching Screenshot 1 */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-blue-400" />
              Monthly Investment Breakdown Data Grid
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/70">
              <table className="w-full text-[11px] text-right font-mono divide-y divide-slate-800">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300">
                    <th className="p-2.5 text-left font-sans font-bold">Category</th>
                    {effectiveInvestments.map((inv) => (
                      <th key={inv.month} className="p-2.5 font-bold whitespace-nowrap">{inv.month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  <tr>
                    <td className="p-2 text-left font-sans text-blue-400 font-semibold">PPF</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.ppf)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-orange-400 font-semibold">EPFO</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.epfo)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-slate-400 font-semibold">NPS</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.nps)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-yellow-400 font-semibold">Equity</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.equity)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-sky-400 font-semibold">ETF</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{inv.etf > 0 ? formatINR(inv.etf) : '₹ -'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-emerald-400 font-semibold">MF</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.mf)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-indigo-400 font-semibold">US Equity</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.usEquity)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-amber-500 font-semibold">FDs</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{formatINR(inv.fds)}</td>)}
                  </tr>
                  <tr className="bg-slate-900/60 font-bold text-white">
                    <td className="p-2 text-left font-sans text-white">Total</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2 text-emerald-300">{formatINR(inv.total)}</td>)}
                  </tr>
                  <tr className="bg-blue-950/20 font-bold text-blue-300">
                    <td className="p-2 text-left font-sans text-blue-400">Change%</td>
                    {effectiveInvestments.map((inv) => <td key={inv.month} className="p-2">{inv.changePercent !== undefined ? `${inv.changePercent}%` : '0%'}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EXPENSE CHART (Dec-23 to Oct-25) matching Image 2 */}
      {/* ========================================================================= */}
      {activeChart === 'expense' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">Expense</h3>
              <p className="text-xs text-slate-400">
                Monthly category distribution across 23 months (Dec-23 to Oct-25) with Total Expense trend
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Latest Month Total: <strong className="text-rose-400 font-bold">{formatINR(effectiveExpenses[effectiveExpenses.length - 1]?.totalExpense || 0)}</strong>
            </div>
          </div>

          {/* SVG Canvas Chart */}
          <div className="overflow-x-auto pb-4">
            <svg viewBox="0 0 1400 360" className="w-full min-w-[1200px] h-84 font-sans">
              {/* Horizontal Gridlines (0 to 1,60,000) */}
              {[0, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000].map((val) => {
                const y = 300 - (val / 160000) * 260;
                return (
                  <g key={val}>
                    <line x1="85" y1={y} x2="1350" y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                    <text x="75" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      ₹ {val.toLocaleString('en-IN')}.00
                    </text>
                  </g>
                );
              })}

              {/* Bars for 23 months */}
              {effectiveExpenses.map((exp, idx) => {
                const x = 110 + idx * 54;
                const barWidth = 4.5;

                const hEnt = (exp.entertainment / 160000) * 260;
                const hFam = (exp.family / 160000) * 260;
                const hHome = (exp.home / 160000) * 260;
                const hPers = (exp.personalAndShopping / 160000) * 260;
                const hTrav = (exp.travel / 160000) * 260;

                return (
                  <g key={exp.month}>
                    <rect x={x - 11} y={300 - hEnt} width={barWidth} height={Math.max(0, hEnt)} fill="#60a5fa" rx="1" />
                    <rect x={x - 6} y={300 - hFam} width={barWidth} height={Math.max(0, hFam)} fill="#fb923c" rx="1" />
                    <rect x={x - 1} y={300 - hHome} width={barWidth} height={Math.max(0, hHome)} fill="#94a3b8" rx="1" />
                    <rect x={x + 4} y={300 - hPers} width={barWidth} height={Math.max(0, hPers)} fill="#facc15" rx="1" />
                    <rect x={x + 9} y={300 - hTrav} width={barWidth} height={Math.max(0, hTrav)} fill="#38bdf8" rx="1" />

                    {/* X Label */}
                    <text x={x} y={320} textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontWeight="600">
                      {exp.month}
                    </text>
                  </g>
                );
              })}

              {/* Green Total Expense Line Overlay */}
              {(() => {
                const points = effectiveExpenses.map((exp, idx) => {
                  const x = 110 + idx * 54;
                  const y = 300 - ((exp.totalExpense || 0) / 160000) * 260;
                  return { x, y, exp };
                });

                const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                return (
                  <g>
                    <path d={pathD} fill="none" stroke="#22c55e" strokeWidth="2.5" />
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#22c55e" stroke="#ffffff" strokeWidth="1" />
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Legend matching Screenshot 2 */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs border-t border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-xs" /> Entertainment</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-400 rounded-xs" /> Family</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-400 rounded-xs" /> Home</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-xs" /> Personal & Shopping</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-sky-400 rounded-xs" /> Travel</span>
            <span className="flex items-center gap-1.5 font-bold"><span className="w-4 h-0.5 bg-green-500" /> Total Expense</span>
          </div>

          {/* Interactive Data Grid Table matching Screenshot 2 */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-emerald-400" />
              Monthly Expense Breakdown Data Grid (23 Months)
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/70">
              <table className="w-full text-[11px] text-right font-mono divide-y divide-slate-800">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300">
                    <th className="p-2.5 text-left font-sans font-bold">Category</th>
                    {effectiveExpenses.map((e) => (
                      <th key={e.month} className="p-2.5 font-bold whitespace-nowrap">{e.month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855 text-slate-300">
                  <tr>
                    <td className="p-2 text-left font-sans text-blue-400 font-semibold">Entertainment</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.entertainment)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-orange-400 font-semibold">Family</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{e.family > 0 ? formatINR(e.family) : '₹ -'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-slate-400 font-semibold">Home</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.home)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-yellow-400 font-semibold">Personal & Shopping</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.personalAndShopping)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-sky-400 font-semibold">Travel</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.travel)}</td>)}
                  </tr>
                  <tr className="bg-emerald-950/20 font-bold text-emerald-300">
                    <td className="p-2 text-left font-sans text-emerald-400">Total Expense</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.totalExpense)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. EXPENSE VS INVESTMENT CHART matching Image 3 */}
      {/* ========================================================================= */}
      {activeChart === 'expense_vs_investment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-white text-lg tracking-tight">Expense Vs Investment</h3>
              <p className="text-xs text-slate-400">
                Comprehensive cash outflow comparison: Total Expense vs. Investment Outflow vs. EMIs and Net Total
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Peak Month Outflow: <strong className="text-sky-400 font-bold">{formatINR(effectiveExpenses.reduce((max, e) => (e.netTotal > max ? e.netTotal : max), 0))}</strong>
            </div>
          </div>

          {/* SVG Canvas Chart */}
          <div className="overflow-x-auto pb-4">
            <svg viewBox="0 0 1400 370" className="w-full min-w-[1200px] h-88 font-sans">
              {/* Horizontal Gridlines (0 to 2,50,000) */}
              {[0, 50000, 100000, 150000, 200000, 250000].map((val) => {
                const y = 300 - (val / 250000) * 260;
                return (
                  <g key={val}>
                    <line x1="85" y1={y} x2="1350" y2={y} stroke="#334155" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6" />
                    <text x="75" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="monospace">
                      ₹ {val.toLocaleString('en-IN')}.00
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {effectiveExpenses.map((exp, idx) => {
                const x = 110 + idx * 54;
                const barWidth = 3.8;

                const hEnt = (exp.entertainment / 250000) * 260;
                const hFam = (exp.family / 250000) * 260;
                const hHome = (exp.home / 250000) * 260;
                const hPers = (exp.personalAndShopping / 250000) * 260;
                const hTrav = (exp.travel / 250000) * 260;
                const hTotExp = (exp.totalExpense / 250000) * 260;
                const hInv = (exp.investment / 250000) * 260;
                const hEMI = (exp.emi / 250000) * 260;

                return (
                  <g key={exp.month}>
                    <rect x={x - 14} y={300 - hEnt} width={barWidth} height={Math.max(0, hEnt)} fill="#60a5fa" rx="1" />
                    <rect x={x - 10} y={300 - hFam} width={barWidth} height={Math.max(0, hFam)} fill="#fb923c" rx="1" />
                    <rect x={x - 6} y={300 - hHome} width={barWidth} height={Math.max(0, hHome)} fill="#94a3b8" rx="1" />
                    <rect x={x - 2} y={300 - hPers} width={barWidth} height={Math.max(0, hPers)} fill="#facc15" rx="1" />
                    <rect x={x + 2} y={300 - hTrav} width={barWidth} height={Math.max(0, hTrav)} fill="#38bdf8" rx="1" />
                    <rect x={x + 6} y={300 - hTotExp} width={barWidth} height={Math.max(0, hTotExp)} fill="#4ade80" rx="1" />
                    <rect x={x + 10} y={300 - hInv} width={barWidth} height={Math.max(0, hInv)} fill="#3730a3" rx="1" />
                    <rect x={x + 14} y={300 - hEMI} width={barWidth} height={Math.max(0, hEMI)} fill="#b45309" rx="1" />

                    <text x={x} y={320} textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontWeight="600">
                      {exp.month}
                    </text>
                  </g>
                );
              })}

              {/* Dark Net Total Line Overlay */}
              {(() => {
                const points = effectiveExpenses.map((exp, idx) => {
                  const x = 110 + idx * 54;
                  const y = 300 - ((exp.netTotal || 0) / 250000) * 260;
                  return { x, y, exp };
                });

                const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');

                return (
                  <g>
                    <path d={pathD} fill="none" stroke="#475569" strokeWidth="3" />
                    {points.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#475569" stroke="#ffffff" strokeWidth="1" />
                    ))}
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Legend matching Screenshot 3 */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs border-t border-slate-800">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-400 rounded-xs" /> Entertainment</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-400 rounded-xs" /> Family</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-400 rounded-xs" /> Home</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-xs" /> Personal & Shopping</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-sky-400 rounded-xs" /> Travel</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-400 rounded-xs" /> Total Expense</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-700 rounded-xs" /> Investment</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-700 rounded-xs" /> EMI</span>
            <span className="flex items-center gap-1.5 font-bold"><span className="w-4 h-0.5 bg-slate-500" /> Net Total</span>
          </div>

          {/* Interactive Data Grid Table matching Screenshot 3 */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TableIcon className="w-4 h-4 text-purple-400" />
              Expense vs Investment Comparison Data Grid
            </h4>
            <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950/70">
              <table className="w-full text-[11px] text-right font-mono divide-y divide-slate-800">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300">
                    <th className="p-2.5 text-left font-sans font-bold">Category</th>
                    {effectiveExpenses.map((e) => (
                      <th key={e.month} className="p-2.5 font-bold whitespace-nowrap">{e.month}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-855 text-slate-300">
                  <tr>
                    <td className="p-2 text-left font-sans text-blue-400 font-semibold">Entertainment</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.entertainment)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-orange-400 font-semibold">Family</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{e.family > 0 ? formatINR(e.family) : '₹ -'}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-slate-400 font-semibold">Home</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.home)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-yellow-400 font-semibold">Personal & Shopping</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.personalAndShopping)}</td>)}
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans text-sky-400 font-semibold">Travel</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.travel)}</td>)}
                  </tr>
                  <tr className="bg-emerald-950/20 font-bold text-emerald-300">
                    <td className="p-2 text-left font-sans text-emerald-400">Total Expense</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.totalExpense)}</td>)}
                  </tr>
                  <tr className="bg-indigo-950/20 font-bold text-indigo-300">
                    <td className="p-2 text-left font-sans text-indigo-400">Investment</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{formatINR(e.investment)}</td>)}
                  </tr>
                  <tr className="bg-amber-950/20 font-bold text-amber-300">
                    <td className="p-2 text-left font-sans text-amber-500">EMI</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2">{e.emi > 0 ? formatINR(e.emi) : '₹ -'}</td>)}
                  </tr>
                  <tr className="bg-slate-800 font-bold text-white">
                    <td className="p-2 text-left font-sans text-white">Net Total</td>
                    {effectiveExpenses.map((e) => <td key={e.month} className="p-2 text-sky-300">{formatINR(e.netTotal)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
