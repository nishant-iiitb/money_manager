/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { Navbar } from './components/Navbar';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { QuickTapWidget } from './components/QuickTapWidget';
import { TransactionsView } from './components/TransactionsView';
import { AccountsAndCardsView } from './components/AccountsAndCardsView';
import { PersonLendingView } from './components/PersonLendingView';
import { CommitmentsBudgetView } from './components/CommitmentsBudgetView';
import { GoalsView } from './components/GoalsView';
import { AIInsightsView } from './components/AIInsightsView';
import { AnalyticsChartsView } from './components/AnalyticsChartsView';
import { CustomCategoriesModal } from './components/CustomCategoriesModal';
import { GoogleDriveSyncModal } from './components/GoogleDriveSyncModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import {
  loadHistoricalInvestments,
  saveHistoricalInvestments,
  loadHistoricalExpenses,
  saveHistoricalExpenses,
  INITIAL_INVESTMENT_SNAPSHOTS,
  INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS,
  ZERO_INVESTMENT_SNAPSHOTS,
  ZERO_EXPENSE_SNAPSHOTS,
} from './data/historicalData';
import {
  Sparkles,
  X,
  WifiOff,
  ReceiptText,
  Landmark,
  Plus,
  Users,
  CalendarClock,
  Target,
  BarChart3,
} from 'lucide-react';

export default function App() {
  const store = useFinanceStore();
  const isOnline = useOnlineStatus();
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

  // Historical Multi-Year Data for Charts
  const [historicalInvestments, setHistoricalInvestments] = useState(loadHistoricalInvestments);
  const [historicalExpenses, setHistoricalExpenses] = useState(loadHistoricalExpenses);

  const handleUpdateHistoricalInvestments = (data: typeof historicalInvestments) => {
    setHistoricalInvestments(data);
    saveHistoricalInvestments(data);
  };

  const handleUpdateHistoricalExpenses = (data: typeof historicalExpenses) => {
    setHistoricalExpenses(data);
    saveHistoricalExpenses(data);
  };

  const handleBulkAddTransactions = (txs: Parameters<typeof store.addTransaction>[0][]) => {
    for (const tx of txs) {
      store.addTransaction(tx);
    }
  };

  const handleResetToZero = () => {
    store.resetToZero();
    setHistoricalInvestments(ZERO_INVESTMENT_SNAPSHOTS);
    setHistoricalExpenses(ZERO_EXPENSE_SNAPSHOTS);
    saveHistoricalInvestments(ZERO_INVESTMENT_SNAPSHOTS);
    saveHistoricalExpenses(ZERO_EXPENSE_SNAPSHOTS);
  };

  const handleLoadDemoData = () => {
    store.loadDemoData();
    setHistoricalInvestments(INITIAL_INVESTMENT_SNAPSHOTS);
    setHistoricalExpenses(INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS);
    saveHistoricalInvestments(INITIAL_INVESTMENT_SNAPSHOTS);
    saveHistoricalExpenses(INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'quick-add', label: 'Quick Tap', icon: Plus },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'accounts', label: 'Bank & Cards', icon: Landmark },
    { id: 'p2p', label: 'P2P Lend & Borrow', icon: Users },
    { id: 'commitments', label: 'Budget & EMIs', icon: CalendarClock },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'analytics', label: 'Analytics & Charts', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Navbar */}
      <Navbar
        totalSavings={store.totalSavingsBalance}
        totalLiabilities={store.calculatedCardsAndPools.totalLiabilities}
        data={store.data}
        onImportData={store.importData}
        onResetToZero={handleResetToZero}
        onLoadDemoData={handleLoadDemoData}
        onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
        onOpenAIInsights={() => setIsAIModalOpen(true)}
        onOpenGoogleDriveSync={() => setIsDriveModalOpen(true)}
        onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
      />

      {/* Offline Status Badge */}
      {!isOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-300 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-1.5">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode Active — 100% functional with local storage.</span>
        </div>
      )}

      {/* Desktop Navigation Tab Bar (Windows Laptop Friendly) */}
      <div className="hidden sm:block border-b border-slate-800 bg-slate-900/60 sticky top-14 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-28">
        {/* Quick Tap Widget Tab */}
        {activeTab === 'quick-add' && (
          <div className="space-y-6">
            <QuickTapWidget
              accounts={store.calculatedAccounts}
              cards={store.calculatedCardsAndPools.allCalculatedCards}
              categories={store.data.categories}
              history={store.data.transactions}
              onAddTransaction={(tx) => {
                store.addTransaction(tx);
              }}
              onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
              onSuccess={() => {
                // Keep for consecutive fast logging
              }}
            />

            {/* Quick overview of latest transactions below the widget */}
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recent Activity
                </span>
                <button
                  onClick={() => setActiveTab('expenses')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  View All ({store.data.transactions.length})
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60 shadow-lg">
                {store.data.transactions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No transactions recorded yet. Use the widget above to log your first expense!
                  </div>
                ) : (
                  store.data.transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{tx.item}</div>
                        <div className="text-[11px] text-slate-400">
                          {tx.category} • {tx.date}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-rose-400">
                        -₹{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Expenses / Ledger Tab */}
        {activeTab === 'expenses' && (
          <TransactionsView
            transactions={store.data.transactions}
            categories={store.data.categories}
            accounts={store.calculatedAccounts}
            cards={store.calculatedCardsAndPools.allCalculatedCards}
            onDeleteTransaction={store.deleteTransaction}
            onOpenQuickAdd={() => setActiveTab('quick-add')}
            onOpenCategoriesModal={() => setIsCategoriesModalOpen(true)}
          />
        )}

        {/* Accounts & Credit Card Pools Tab */}
        {activeTab === 'accounts' && (
          <AccountsAndCardsView
            accounts={store.calculatedAccounts}
            pools={store.calculatedCardsAndPools.pools}
            standaloneCards={store.calculatedCardsAndPools.standaloneCards}
            totalSavings={store.totalSavingsBalance}
            totalWallets={store.totalWalletsBalance}
            totalLiabilities={store.calculatedCardsAndPools.totalLiabilities}
            totalLimits={store.calculatedCardsAndPools.totalLimits}
            totalAvailableLimit={store.calculatedCardsAndPools.totalAvailableLimit}
            overallUtilization={store.calculatedCardsAndPools.overallUtilization}
            onReconcileAccount={store.reconcileAccountBalance}
            onAddAccount={store.addAccount}
            onUpdateAccount={store.updateAccount}
            onDeleteAccount={store.deleteAccount}
            onAddCard={store.addCreditCard}
            onUpdateCard={store.updateCreditCard}
            onDeleteCard={store.deleteCreditCard}
            onAddCardPool={store.addCardPool}
            onRecordCardPayment={(cardId, fromAccountId, amount) =>
              store.recordCardPayment({
                fromAccountId,
                toCardId: cardId,
                amount,
                date: new Date().toISOString().split('T')[0],
              })
            }
          />
        )}

        {/* P2P Borrow & Lending Tab */}
        {activeTab === 'p2p' && (
          <PersonLendingView
            records={store.data.personLending || []}
            accounts={store.calculatedAccounts}
            onAddRecord={store.addPersonRecord}
            onRecordSettlement={store.recordPersonSettlement}
            onUpdateRecord={store.updatePersonRecord}
            onDeleteRecord={store.deletePersonRecord}
          />
        )}

        {/* Commitments & Budget Tab */}
        {activeTab === 'commitments' && (
          <CommitmentsBudgetView
            commitments={store.data.commitments}
            householdBudgets={store.data.householdBudgets}
            investments={store.data.investments}
            onAddCommitment={store.addCommitment}
            onUpdateCommitment={store.updateCommitment}
            onDeleteCommitment={store.deleteCommitment}
            onUpdateHouseholdBudget={store.updateHouseholdBudget}
            onAddHouseholdBudget={store.addHouseholdBudget}
            onUpdateInvestment={store.updateInvestment}
            onAddInvestment={store.addInvestment}
          />
        )}

        {/* Financial Goals Tab */}
        {activeTab === 'goals' && (
          <GoalsView
            goals={store.data.goals}
            accounts={store.calculatedAccounts}
            transactions={store.data.transactions}
            onAddGoal={store.addGoal}
            onUpdateGoal={store.updateGoal}
            onDeleteGoal={store.deleteGoal}
            onAllocateFunds={store.allocateFundsToGoal}
          />
        )}

        {/* Analytics & Net Worth Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsChartsView
            transactions={store.data.transactions}
            categories={store.data.categories}
            totalSavings={store.totalSavingsBalance}
            totalWallets={store.totalWalletsBalance}
            totalLiabilities={store.calculatedCardsAndPools.totalLiabilities}
            totalInvestments={store.netWorthSummary.investmentsAssets}
            netWorthSummary={store.netWorthSummary}
            historicalInvestments={historicalInvestments}
            historicalExpenses={historicalExpenses}
            onOpenBulkUpload={() => setIsBulkUploadOpen(true)}
            onResetToZero={handleResetToZero}
            onLoadDemoData={handleLoadDemoData}
          />
        )}
      </main>

      {/* Bulk Upload Modal */}
      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        onBulkAddTransactions={handleBulkAddTransactions}
        onUpdateHistoricalInvestments={handleUpdateHistoricalInvestments}
        onUpdateHistoricalExpenses={handleUpdateHistoricalExpenses}
      />

      {/* Custom Budget Categories Modal */}
      <CustomCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={store.data.categories}
        onAddCategory={store.addCategory}
        onUpdateCategory={store.updateCategory}
        onDeleteCategory={store.deleteCategory}
      />

      {/* Google Drive Sync Modal */}
      <GoogleDriveSyncModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        currentData={store.data}
        onRestoreData={(restored) => {
          store.importData(restored);
        }}
      />

      {/* AI Insights Modal */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <AIInsightsView data={store.data} />
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
}
