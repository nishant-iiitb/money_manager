import React, { useState, useRef } from 'react';
import {
  Wallet,
  CreditCard,
  Wifi,
  WifiOff,
  MoreVertical,
  Download,
  FileSpreadsheet,
  Upload,
  RotateCcw,
  Sparkles,
  Layers,
  Cloud,
  Trash2,
  Database,
  Lock,
} from 'lucide-react';
import { formatCompactINR } from '../utils/formatters';
import { useOnlineStatus } from '../hooks/usePWAInstall';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { exportDataAsJSON, exportTransactionsAsCSV, parseImportedJSON } from '../utils/storage';
import { FinanceData } from '../types/finance';

interface NavbarProps {
  totalSavings: number;
  totalLiabilities: number;
  data: FinanceData;
  onImportData: (data: FinanceData) => void;
  onResetToZero: () => void;
  onLoadDemoData: () => void;
  onOpenCategoriesModal: () => void;
  onOpenAIInsights: () => void;
  onOpenGoogleDriveSync: () => void;
  onOpenBulkUpload?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalSavings,
  totalLiabilities,
  data,
  onImportData,
  onResetToZero,
  onLoadDemoData,
  onOpenCategoriesModal,
  onOpenAIInsights,
  onOpenGoogleDriveSync,
  onOpenBulkUpload,
}) => {
  const isOnline = useOnlineStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showZeroConfirm, setShowZeroConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseImportedJSON(text);
        onImportData(parsed);
      } catch (err: any) {
        console.error('Failed to parse backup JSON file', err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 pt-safe px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-950/40 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400 font-extrabold text-base">
              ₹
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                My Finance Manager
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                Offline + Drive
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              {isOnline ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced Local
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <WifiOff className="w-3 h-3" />
                  Offline Mode
                </span>
              )}
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{data.transactions.length} entries</span>
            </div>
          </div>
        </div>

        {/* Live Badges (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Liquid Savings Badge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Liquid Savings</div>
              <div className="text-xs font-bold font-mono text-emerald-400">
                {formatCompactINR(totalSavings)}
              </div>
            </div>
          </div>

          {/* CC Liabilities Badge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1 flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <CreditCard className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">CC Liabilities</div>
              <div className="text-xs font-bold font-mono text-rose-400">
                {formatCompactINR(totalLiabilities)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions & Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Google Drive Sync Button */}
          <button
            onClick={onOpenGoogleDriveSync}
            className="px-2.5 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
            title="Google Drive Private Cloud Sync"
          >
            <Cloud className="w-4 h-4 text-blue-400" />
            <span className="hidden sm:inline">Drive Sync</span>
          </button>

          {/* AI Insights Button */}
          <button
            onClick={onOpenAIInsights}
            className="px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
            title="AI Spending Insights & Predictor"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Insights</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallPrompt />

          {/* Data Menu dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Backup, export & settings"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 text-xs text-slate-200 divide-y divide-slate-800">
                  <div className="px-3 py-2 text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                    <span>Manage Data</span>
                    <span className="text-[10px] text-emerald-400 font-mono">100% Private</span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onOpenGoogleDriveSync();
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 text-blue-300 transition"
                    >
                      <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Google Drive Backup</div>
                        <div className="text-[10px] text-slate-400">Sync all raw transactions to Drive</div>
                      </div>
                    </button>

                    {onOpenBulkUpload && (
                      <button
                        onClick={() => {
                          onOpenBulkUpload();
                          setMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 text-emerald-300 transition"
                      >
                        <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-white">Bulk Upload Data</div>
                          <div className="text-[10px] text-slate-400">Import CSV or historical records</div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenCategoriesModal();
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 transition"
                    >
                      <Layers className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Custom Categories</div>
                        <div className="text-[10px] text-slate-400">Manage budget targets & tags</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        exportDataAsJSON(data);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 transition"
                    >
                      <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Export Full JSON Backup</div>
                        <div className="text-[10px] text-slate-400">Complete raw transactions ledger</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        exportTransactionsAsCSV(data);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 transition"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-sky-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Export CSV (Excel Sheet)</div>
                        <div className="text-[10px] text-slate-400">Open in MS Excel / Apple Numbers</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-800 transition"
                    >
                      <Database className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <div className="font-semibold text-white">Restore Backup (JSON)</div>
                        <div className="text-[10px] text-slate-400">Upload a saved backup file</div>
                      </div>
                    </button>
                  </div>

                  {/* Reset Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowZeroConfirm(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-rose-950/40 text-rose-300 transition"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Reset Everything to 0</div>
                        <div className="text-[10px] text-slate-400">Clear all records for clean start</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowDemoConfirm(true);
                        setMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-amber-950/40 text-amber-300 transition"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-semibold">Load Excel Sample Data</div>
                        <div className="text-[10px] text-slate-400">Test with original demo figures</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Confirmation Modal for Reset to 0 */}
      {showZeroConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h4 className="font-extrabold text-white text-base">Reset Everything to 0?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear all transactions, reset bank balances to ₹0, reset credit card liabilities to ₹0, and clear P2P borrow & lending records.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowZeroConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetToZero();
                  setShowZeroConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Yes, Reset to 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Demo Data */}
      {showDemoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="w-5 h-5" />
              <h4 className="font-extrabold text-white text-base">Load Excel Demo Data?</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will populate sample figures from the Excel screenshots (HDFC, BOB, Kotak, credit cards & sample transactions) for testing purposes.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowDemoConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onLoadDemoData();
                  setShowDemoConfirm(false);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Load Sample Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
