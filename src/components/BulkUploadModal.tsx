import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Check,
  AlertCircle,
  FileText,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import {
  MonthlyInvestmentSnapshot,
  MonthlyExpenseVsInvestmentSnapshot,
} from '../types/historical';
import {
  INITIAL_INVESTMENT_SNAPSHOTS,
  INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS,
} from '../data/historicalData';
import { formatINR } from '../utils/formatters';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkAddTransactions: (txs: Omit<Transaction, 'id' | 'createdAt'>[]) => void;
  onUpdateHistoricalInvestments: (data: MonthlyInvestmentSnapshot[]) => void;
  onUpdateHistoricalExpenses: (data: MonthlyExpenseVsInvestmentSnapshot[]) => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  onBulkAddTransactions,
  onUpdateHistoricalInvestments,
  onUpdateHistoricalExpenses,
}) => {
  const [importType, setImportType] = useState<'transactions' | 'monthly_expenses' | 'investments'>('transactions');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Parse CSV text
  const parseCSV = (text: string) => {
    setParseError(null);
    setSuccessMessage(null);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    try {
      const lines = text
        .trim()
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      if (lines.length < 2) {
        throw new Error('CSV must contain at least a header row and one data row.');
      }

      // Split header
      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

      const dataRows = [];
      for (let i = 1; i < lines.length; i++) {
        // Regex to split comma while respecting quotes
        const values = lines[i]
          .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
          .map((v) => v.replace(/^["']|["']$/g, '').trim());

        if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

        if (importType === 'transactions') {
          // Expected: Date, Category, Item/Subcategory, Amount, Account
          const dateIdx = headers.findIndex((h) => h.includes('date'));
          const catIdx = headers.findIndex((h) => h.includes('cat'));
          const itemIdx = headers.findIndex((h) => h.includes('item') || h.includes('sub') || h.includes('desc'));
          const amtIdx = headers.findIndex((h) => h.includes('amount') || h.includes('inr') || h.includes('price') || h.includes('₹'));
          const acctIdx = headers.findIndex((h) => h.includes('acc') || h.includes('card') || h.includes('bank') || h.includes('pay'));

          const rawDate = dateIdx >= 0 ? values[dateIdx] : values[0];
          const rawCat = catIdx >= 0 ? values[catIdx] : values[1] || 'Personal';
          const rawItem = itemIdx >= 0 ? values[itemIdx] : values[2] || 'Expense';
          const rawAmt = amtIdx >= 0 ? values[amtIdx] : values[3];
          const rawAcct = acctIdx >= 0 ? values[acctIdx] : values[4] || 'BOB';

          // Clean amount: remove ₹, commas, spaces
          const cleanAmt = parseFloat(String(rawAmt || '').replace(/[₹,$\s]/g, '')) || 0;

          // Convert date (DD-MM-YYYY or YYYY-MM-DD)
          let dateStr = rawDate;
          if (rawDate && rawDate.includes('-')) {
            const parts = rawDate.split('-');
            if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
              // DD-MM-YYYY -> YYYY-MM-DD
              dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          dataRows.push({
            date: dateStr || new Date().toISOString().split('T')[0],
            category: rawCat,
            item: rawItem,
            amount: cleanAmt,
            accountId: rawAcct.toLowerCase().replace(/\s+/g, '-'),
            type: 'expense' as const,
          });
        } else if (importType === 'monthly_expenses') {
          // Expected: Month, Entertainment, Family, Home, Personal & Shopping, Travel, Investment, EMI
          const month = values[0];
          const ent = parseFloat(String(values[1] || '').replace(/[₹,$\s]/g, '')) || 0;
          const fam = parseFloat(String(values[2] || '').replace(/[₹,$\s]/g, '')) || 0;
          const home = parseFloat(String(values[3] || '').replace(/[₹,$\s]/g, '')) || 0;
          const pers = parseFloat(String(values[4] || '').replace(/[₹,$\s]/g, '')) || 0;
          const trav = parseFloat(String(values[5] || '').replace(/[₹,$\s]/g, '')) || 0;
          const totalExp = ent + fam + home + pers + trav;
          const inv = parseFloat(String(values[6] || '').replace(/[₹,$\s]/g, '')) || 0;
          const emi = parseFloat(String(values[7] || '').replace(/[₹,$\s]/g, '')) || 0;

          dataRows.push({
            month,
            entertainment: ent,
            family: fam,
            home,
            personalAndShopping: pers,
            travel: trav,
            totalExpense: totalExp,
            investment: inv,
            emi,
            netTotal: totalExp + inv + emi,
          });
        } else if (importType === 'investments') {
          // Expected: Month, PPF, EPFO, NPS, Equity, ETF, MF, US Equity, FDs
          const month = values[0];
          const ppf = parseFloat(String(values[1] || '').replace(/[₹,$\s]/g, '')) || 0;
          const epfo = parseFloat(String(values[2] || '').replace(/[₹,$\s]/g, '')) || 0;
          const nps = parseFloat(String(values[3] || '').replace(/[₹,$\s]/g, '')) || 0;
          const eq = parseFloat(String(values[4] || '').replace(/[₹,$\s]/g, '')) || 0;
          const etf = parseFloat(String(values[5] || '').replace(/[₹,$\s]/g, '')) || 0;
          const mf = parseFloat(String(values[6] || '').replace(/[₹,$\s]/g, '')) || 0;
          const useq = parseFloat(String(values[7] || '').replace(/[₹,$\s]/g, '')) || 0;
          const fds = parseFloat(String(values[8] || '').replace(/[₹,$\s]/g, '')) || 0;
          const total = ppf + epfo + nps + eq + etf + mf + useq + fds;

          dataRows.push({
            month,
            ppf,
            epfo,
            nps,
            equity: eq,
            etf,
            mf,
            usEquity: useq,
            fds,
            total,
          });
        }
      }

      setParsedRows(dataRows);
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse CSV format.');
      setParsedRows([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPastedText(content);
      parseCSV(content);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyImport = () => {
    if (parsedRows.length === 0) return;

    if (importType === 'transactions') {
      onBulkAddTransactions(parsedRows);
      setSuccessMessage(`Successfully imported ${parsedRows.length} transactions!`);
    } else if (importType === 'monthly_expenses') {
      onUpdateHistoricalExpenses(parsedRows);
      setSuccessMessage(`Successfully updated ${parsedRows.length} monthly expense snapshots!`);
    } else if (importType === 'investments') {
      onUpdateHistoricalInvestments(parsedRows);
      setSuccessMessage(`Successfully updated ${parsedRows.length} monthly investment snapshots!`);
    }

    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Sample data templates
  const loadTemplate = () => {
    if (importType === 'transactions') {
      const template = `Date,Category,Subcategory,Amount,Account
01-09-2026,Travel,Fuel,448.23,Yes CC
02-09-2026,Travel,Taxi,114.00,BOB
02-09-2026,Stuti,Cake,1200.00,BOB
02-09-2026,Family,Sirjan Gift,140.00,BOB
02-09-2026,Stuti,Birthday Party Burger,2096.00,Swiggy CC
02-09-2026,Personal,Salon,150.00,Yes CC
02-09-2026,Home,Food Maid,4670.00,UBI`;
      setPastedText(template);
      parseCSV(template);
    } else if (importType === 'monthly_expenses') {
      const template = `Month,Entertainment,Family,Home,Personal & Shopping,Travel,Investment,EMI
Dec-23,460,9714,28439,11106,6161,17732,0
Jan-24,732,0,42611,11028,6028,31732,0
Feb-24,337,19318,24865,13728,2286,29216,0
Mar-24,337,11703,25100,3683,360,38750,12000
Apr-24,337,4543,37249,2889,1387,58756,14500`;
      setPastedText(template);
      parseCSV(template);
    } else if (importType === 'investments') {
      const template = `Month,PPF,EPFO,NPS,Equity,ETF,MF,US Equity,FDs
Sep-24,20053,419222,62790,149061,0,113650,4530,10384
Oct-24,20053,432112,68042,147815,0,123594,4690,10430
Nov-24,20053,445002,68656,144568,0,140109,4870,10492
Dec-24,20053,457892,67982,154890,0,170331,5070,10566`;
      setPastedText(template);
      parseCSV(template);
    }
  };

  const handleLoadFullExcelScreenshotsData = () => {
    onUpdateHistoricalInvestments(INITIAL_INVESTMENT_SNAPSHOTS);
    onUpdateHistoricalExpenses(INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS);
    setSuccessMessage('Successfully loaded full 2-year historical records (Dec 2023 - Nov 2025) into the charts!');
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Bulk Upload Historical Data</h3>
              <p className="text-xs text-slate-400">Import CSV or paste records for previous months</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* 1-Click Load Excel Screenshots Data Banner */}
          <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-sky-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Preload Data From Your Screenshots
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Load the complete historical records from your 3 Excel sheet screenshots (Dec-23 through Nov-25).
              </p>
            </div>
            <button
              onClick={handleLoadFullExcelScreenshotsData}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 shadow-md transition active:scale-95"
            >
              Load Screenshot Data
            </button>
          </div>

          {/* Import Mode Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select What You Want To Upload
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportType('transactions');
                  setPastedText('');
                  setParsedRows([]);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  importType === 'transactions'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                1. Transactions Log
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportType('monthly_expenses');
                  setPastedText('');
                  setParsedRows([]);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  importType === 'monthly_expenses'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                2. Monthly Expenses
              </button>

              <button
                type="button"
                onClick={() => {
                  setImportType('investments');
                  setPastedText('');
                  setParsedRows([]);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  importType === 'investments'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                3. Investment History
              </button>
            </div>
          </div>

          {/* File Upload & Template Trigger */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1.5 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload CSV File</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".csv,.txt"
                className="hidden"
              />
            </div>

            <button
              type="button"
              onClick={loadTemplate}
              className="text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              Insert Sample Template
            </button>
          </div>

          {/* Textarea for pasting */}
          <div>
            <textarea
              rows={6}
              placeholder="Paste comma-separated rows here (e.g. Date, Category, Subcategory, Amount, Account)..."
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                parseCSV(e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-600 font-mono outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Status Message */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {parseError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">
                  Preview ({parsedRows.length} rows ready to import)
                </span>
              </div>

              <div className="max-h-40 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/60 divide-y divide-slate-850 text-xs font-mono">
                {parsedRows.slice(0, 8).map((row, i) => (
                  <div key={i} className="p-2 flex items-center justify-between">
                    <span className="truncate pr-2 text-slate-300">
                      {row.date || row.month} • {row.item || row.totalExpense || row.total}
                    </span>
                    <span className="font-bold text-emerald-400 shrink-0">
                      {formatINR(row.amount || row.totalExpense || row.total)}
                    </span>
                  </div>
                ))}
                {parsedRows.length > 8 && (
                  <div className="p-2 text-center text-[10px] text-slate-500">
                    ... and {parsedRows.length - 8} more rows
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyImport}
            disabled={parsedRows.length === 0}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-40"
          >
            Confirm & Import Data
          </button>
        </div>
      </div>
    </div>
  );
};
