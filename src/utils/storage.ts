import { FinanceData } from '../types/finance';
import {
  CLEAN_ZERO_FINANCE_DATA,
  EXCEL_DEMO_FINANCE_DATA,
  INITIAL_FINANCE_DATA,
} from '../data/initialData';
import {
  resetHistoricalDataToZero,
  loadDemoHistoricalSnapshots,
} from '../data/historicalData';

const STORAGE_KEY = 'my_finance_manager_v2';

export function loadFinanceData(): FinanceData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveFinanceData(INITIAL_FINANCE_DATA);
      return INITIAL_FINANCE_DATA;
    }
    const parsed = JSON.parse(raw);

    // Ensure all required fields exist (in case of schema upgrades)
    return {
      accounts: parsed.accounts || INITIAL_FINANCE_DATA.accounts,
      cardPools: parsed.cardPools || INITIAL_FINANCE_DATA.cardPools,
      creditCards: parsed.creditCards || INITIAL_FINANCE_DATA.creditCards,
      transactions: parsed.transactions || [],
      commitments: parsed.commitments || INITIAL_FINANCE_DATA.commitments,
      householdBudgets: parsed.householdBudgets || INITIAL_FINANCE_DATA.householdBudgets,
      categories: parsed.categories || INITIAL_FINANCE_DATA.categories,
      goals: parsed.goals || INITIAL_FINANCE_DATA.goals,
      investments: parsed.investments || INITIAL_FINANCE_DATA.investments,
      customAssets: parsed.customAssets || [],
      customLiabilities: parsed.customLiabilities || [],
      personLending: parsed.personLending || [],
      lastUpdated: parsed.lastUpdated || Date.now(),
    };
  } catch (err) {
    console.error('Failed to load finance data from localStorage', err);
    return INITIAL_FINANCE_DATA;
  }
}

export function saveFinanceData(data: FinanceData): void {
  try {
    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save finance data to localStorage', err);
  }
}

export function resetToInitialData(): FinanceData {
  saveFinanceData(CLEAN_ZERO_FINANCE_DATA);
  resetHistoricalDataToZero();
  return CLEAN_ZERO_FINANCE_DATA;
}

export function resetToZeroSlate(): FinanceData {
  saveFinanceData(CLEAN_ZERO_FINANCE_DATA);
  resetHistoricalDataToZero();
  return CLEAN_ZERO_FINANCE_DATA;
}

export function loadDemoExcelData(): FinanceData {
  saveFinanceData(EXCEL_DEMO_FINANCE_DATA);
  loadDemoHistoricalSnapshots();
  return EXCEL_DEMO_FINANCE_DATA;
}

/**
 * Export full database to a JSON file download (all transactions, accounts, P2P lending, etc.)
 */
export function exportDataAsJSON(data: FinanceData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `my-finance-manager-backup-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export transactions as CSV matching user's spreadsheet format
 */
export function exportTransactionsAsCSV(data: FinanceData): void {
  const headers = ['Date', 'Category', 'Subcategory / Item', 'Amount (INR)', 'Account / Card', 'Type', 'Notes'];
  const rows = data.transactions.map((tx) => {
    // Resolve account/card name
    const acct =
      data.accounts.find((a) => a.id === tx.accountId) ||
      data.creditCards.find((c) => c.id === tx.accountId);
    const acctName = acct ? acct.name : tx.accountId;

    // Format date DD-MM-YYYY
    const parts = (tx.date || '').split('-');
    const formattedDate =
      parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : tx.date;

    return [
      `"${formattedDate}"`,
      `"${(tx.category || '').replace(/"/g, '""')}"`,
      `"${(tx.item || '').replace(/"/g, '""')}"`,
      tx.amount.toFixed(2),
      `"${acctName.replace(/"/g, '""')}"`,
      `"${tx.type}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `my-finance-manager-transactions-${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse an imported JSON file string
 */
export function parseImportedJSON(content: string): FinanceData {
  const parsed = JSON.parse(content);
  if (!parsed.accounts || !parsed.creditCards || !parsed.transactions) {
    throw new Error('Invalid backup file format: missing essential accounts or transactions data.');
  }
  return {
    accounts: parsed.accounts,
    cardPools: parsed.cardPools || [],
    creditCards: parsed.creditCards,
    transactions: parsed.transactions,
    commitments: parsed.commitments || [],
    householdBudgets: parsed.householdBudgets || [],
    categories: parsed.categories || CLEAN_ZERO_FINANCE_DATA.categories,
    goals: parsed.goals || [],
    investments: parsed.investments || [],
    customAssets: parsed.customAssets || [],
    customLiabilities: parsed.customLiabilities || [],
    personLending: parsed.personLending || [],
    lastUpdated: Date.now(),
  };
}
