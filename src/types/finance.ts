export type TransactionType = 'expense' | 'income' | 'transfer' | 'card_payment';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  category: string; // Default or custom category ID / name
  item: string; // Subcategory / Description
  amount: number;
  type: TransactionType;
  accountId: string; // Bank account or Credit card used
  destinationAccountId?: string; // If transfer or card payment
  notes?: string;
  createdAt: number;
}

export interface BankAccount {
  id: string;
  name: string;
  accountType: 'savings' | 'salary' | 'wallet' | 'food_card';
  initialBalance: number;
  purpose: string; // e.g., Salary, Investment, Rent, Daily Needs, CC, Emergency
  neededMonthly: number; // Target needed / allocation from user's sheet
  color: string;
  accountNumberLast4?: string;
}

export interface CreditCardPool {
  id: string;
  name: string; // e.g. "ICICI Group Pool", "HDFC Group Pool", "AXIS Group Pool"
  totalLimit: number;
}

export interface CreditCard {
  id: string;
  name: string; // e.g. "ICICI Rubyx Amex", "SBI", "YES BANK"
  bank: string;
  poolId?: string; // If sharing a common limit with other cards
  standaloneLimit?: number; // Used only if poolId is not present
  initialLiability: number; // Starting liability / previous balance
  billedAmount: number; // Last generated statement amount
  dueDateDay?: number;
  billingCycleDay?: number;
  color: string;
  network?: 'visa' | 'mastercard' | 'rupay' | 'amex' | 'diners';
}

export interface RecurringCommitment {
  id: string;
  name: string; // e.g. "Max Life Term 1", "Niva Bupa"
  category: 'insurance' | 'emi' | 'subscription' | 'rd';
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Half Yearly' | 'Yearly';
  dueMonthRemark?: string; // e.g. "Monthly", "Yearly (Sep)", "Half Yearly (Feb, Aug)", "As per last statement (May)"
  autoDeductAccount?: string;
  active: boolean;
}

export interface MonthlyHouseholdBudget {
  id: string;
  name: string; // e.g. "Rent", "Maintenance + Electricity + Water", "Maid", "Grocery", "Travel"
  category: string; // Matched against transaction categories
  actualAmount: number;
  plannedAmount: number;
  notes?: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  color: string;
  iconName: string;
  isDefault?: boolean;
  monthlyTarget?: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  savedAmount: number;
  linkedAccountId?: string; // Bank account associated with this goal
  color: string;
  iconName?: string;
  notes?: string;
  createdAt: number;
}

export interface InvestmentEntry {
  id: string;
  name: string; // e.g. "MF", "NPS", "PPF", "Emergency", "Zerodha", "RD Insurance"
  currentAmount: number;
  proposedAmount: number;
  remarks?: string;
}

export interface CustomAsset {
  id: string;
  name: string;
  category: 'savings' | 'investment' | 'property' | 'other';
  value: number;
}

export interface CustomLiability {
  id: string;
  name: string;
  value: number;
}

export type PersonTransactionType = 'lent' | 'borrowed'; // lent = Asset (Receivable), borrowed = Liability (Payable)

export interface PersonSettlement {
  id: string;
  date: string;
  amount: number;
  accountId?: string;
  notes?: string;
}

export interface PersonLendingRecord {
  id: string;
  personName: string;
  type: PersonTransactionType; // 'lent' (Asset: money I gave) | 'borrowed' (Liability: money I received)
  originalAmount: number;
  remainingAmount: number;
  date: string; // YYYY-MM-DD
  dueDate?: string; // Expected return date
  notes?: string;
  accountId?: string; // Bank account used to send/receive funds
  settled: boolean;
  settlements: PersonSettlement[];
  createdAt: number;
}

export interface AIInsightRecommendation {
  title: string;
  description: string;
  potentialMonthlySavings?: number;
  category: string;
  actionableStep: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface AIOverspendingRisk {
  category: string;
  currentSpend: number;
  projectedSpend: number;
  budgetOrHistoricalAvg: number;
  riskLevel: 'caution' | 'warning' | 'critical';
  reason: string;
}

export interface AISpendingAnalysis {
  summary: string;
  keyTrends: string[];
  overspendingRisks: AIOverspendingRisk[];
  recommendations: AIInsightRecommendation[];
  totalPotentialSavings: number;
  financialHealthScore: number; // 0 to 100
  generatedAt: number;
}

export interface FinanceData {
  accounts: BankAccount[];
  cardPools: CreditCardPool[];
  creditCards: CreditCard[];
  transactions: Transaction[];
  commitments: RecurringCommitment[];
  householdBudgets: MonthlyHouseholdBudget[];
  categories: CustomCategory[];
  goals: FinancialGoal[];
  investments: InvestmentEntry[];
  customAssets: CustomAsset[];
  customLiabilities: CustomLiability[];
  personLending: PersonLendingRecord[];
  lastUpdated: number;
}
