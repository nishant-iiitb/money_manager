import {
  MonthlyInvestmentSnapshot,
  MonthlyExpenseVsInvestmentSnapshot,
} from '../types/historical';

export const INITIAL_INVESTMENT_SNAPSHOTS: MonthlyInvestmentSnapshot[] = [
  { month: 'Sep-24', ppf: 20053, epfo: 419222, nps: 62790, equity: 149061, etf: 0, mf: 113650, usEquity: 4530, fds: 10384, total: 779690, changePercent: undefined },
  { month: 'Oct-24', ppf: 20053, epfo: 432112, nps: 68042, equity: 147815, etf: 0, mf: 123594, usEquity: 4690, fds: 10430, total: 806736, changePercent: 3.469 },
  { month: 'Nov-24', ppf: 20053, epfo: 445002, nps: 68656, equity: 144568, etf: 0, mf: 140109, usEquity: 4870, fds: 10492, total: 833750, changePercent: 3.349 },
  { month: 'Dec-24', ppf: 20053, epfo: 457892, nps: 67982, equity: 154890, etf: 0, mf: 170331, usEquity: 5070, fds: 10566, total: 886784, changePercent: 6.361 },
  { month: 'Jan-25', ppf: 20053, epfo: 470782, nps: 67019, equity: 152800, etf: 0, mf: 196191, usEquity: 4950, fds: 10621, total: 922416, changePercent: 4.018 },
  { month: 'Feb-25', ppf: 20053, epfo: 483672, nps: 65495, equity: 141961, etf: 9982, mf: 219034, usEquity: 5134, fds: 20660, total: 965991, changePercent: 4.724 },
  { month: 'Mar-25', ppf: 20053, epfo: 500525, nps: 65495, equity: 127188, etf: 9587, mf: 232602, usEquity: 5124, fds: 20833, total: 981407, changePercent: 1.596 },
  { month: 'Apr-25', ppf: 21477, epfo: 517380, nps: 63197, equity: 135253, etf: 9988, mf: 257873, usEquity: 4250, fds: 20987, total: 1030405, changePercent: 4.993 },
  { month: 'May-25', ppf: 21477, epfo: 534234, nps: 66206, equity: 140325, etf: 10430, mf: 287629, usEquity: 4620, fds: 21095, total: 1086016, changePercent: 5.397 },
  { month: 'Jun-25', ppf: 21447, epfo: 551088, nps: 67644, equity: 142336, etf: 10700, mf: 308138, usEquity: 4970, fds: 41228, total: 1147551, changePercent: 5.666 },
  { month: 'Jul-25', ppf: 21447, epfo: 577984, nps: 68538, equity: 145368, etf: 11110, mf: 263904, usEquity: 5210, fds: 41479, total: 1135040, changePercent: -1.090 },
  { month: 'Aug-25', ppf: 21447, epfo: 603087, nps: 69410, equity: 149655, etf: 11090, mf: 274253, usEquity: 5520, fds: 41733, total: 1176195, changePercent: 3.626 },
  { month: 'Sep-25', ppf: 21447, epfo: 636795, nps: 69140, equity: 156490, etf: 11580, mf: 252120, usEquity: 5620, fds: 42029, total: 1195221, changePercent: 1.618 },
  { month: 'Oct-25', ppf: 21447, epfo: 653649, nps: 69079, equity: 160363, etf: 12856, mf: 255845, usEquity: 5710, fds: 42309, total: 1221258, changePercent: 2.178 },
  { month: 'Nov-25', ppf: 21447, epfo: 653649, nps: 69079, equity: 162618, etf: 12712, mf: 260729, usEquity: 5950, fds: 42464, total: 1228648, changePercent: 0.605 },
];

export const INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS: MonthlyExpenseVsInvestmentSnapshot[] = [
  { month: 'Dec-23', entertainment: 460, family: 9714, home: 28439, personalAndShopping: 11106, travel: 6161, totalExpense: 55880, investment: 17732, emi: 0, netTotal: 73612 },
  { month: 'Jan-24', entertainment: 732, family: 0, home: 42611, personalAndShopping: 11028, travel: 6028, totalExpense: 60399, investment: 31732, emi: 0, netTotal: 92131 },
  { month: 'Feb-24', entertainment: 337, family: 19318, home: 24865, personalAndShopping: 13728, travel: 2286, totalExpense: 60534, investment: 29216, emi: 0, netTotal: 89750 },
  { month: 'Mar-24', entertainment: 337, family: 11703, home: 25100, personalAndShopping: 3683, travel: 360, totalExpense: 41183, investment: 38750, emi: 12000, netTotal: 91933 },
  { month: 'Apr-24', entertainment: 337, family: 4543, home: 37249, personalAndShopping: 2889, travel: 1387, totalExpense: 46405, investment: 58756, emi: 14500, netTotal: 119661 },
  { month: 'May-24', entertainment: 119, family: 2546, home: 27561, personalAndShopping: 13161, travel: 3459, totalExpense: 46846, investment: 27732, emi: 19000, netTotal: 93578 },
  { month: 'Jun-24', entertainment: 457, family: 0, home: 37351, personalAndShopping: 15894, travel: 4012, totalExpense: 57714, investment: 30732, emi: 19000, netTotal: 107446 },
  { month: 'Jul-24', entertainment: 447, family: 0, home: 27480, personalAndShopping: 26933, travel: 2135, totalExpense: 56995, investment: 30232, emi: 19000, netTotal: 106227 },
  { month: 'Aug-24', entertainment: 447, family: 2825, home: 26328, personalAndShopping: 9550, travel: 2015, totalExpense: 41165, investment: 143740, emi: 19000, netTotal: 203905 },
  { month: 'Sep-24', entertainment: 447, family: 2459, home: 32380, personalAndShopping: 24750, travel: 2652, totalExpense: 62688, investment: 29732, emi: 7000, netTotal: 99420 },
  { month: 'Oct-24', entertainment: 467, family: 4785, home: 32242, personalAndShopping: 25441, travel: 3084, totalExpense: 66019, investment: 29732, emi: 5000, netTotal: 100751 },
  { month: 'Nov-24', entertainment: 467, family: 17706, home: 20522, personalAndShopping: 9861, travel: 4436, totalExpense: 52992, investment: 29732, emi: 5000, netTotal: 87724 },
  { month: 'Dec-24', entertainment: 467, family: 1330, home: 29478, personalAndShopping: 26935, travel: 4305, totalExpense: 62515, investment: 39732, emi: 5000, netTotal: 107247 },
  { month: 'Jan-25', entertainment: 1517, family: 1000, home: 36309, personalAndShopping: 10390, travel: 8508, totalExpense: 57724, investment: 45232, emi: 0, netTotal: 102956 },
  { month: 'Feb-25', entertainment: 467, family: 22648, home: 22843, personalAndShopping: 5966, travel: 7321, totalExpense: 59245, investment: 53217, emi: 0, netTotal: 112462 },
  { month: 'Mar-25', entertainment: 1072, family: 9405, home: 33354, personalAndShopping: 31167, travel: 3199, totalExpense: 78197, investment: 22232, emi: 0, netTotal: 100429 },
  { month: 'Apr-25', entertainment: 467, family: 11981, home: 30270, personalAndShopping: 24175, travel: 2041, totalExpense: 68934, investment: 34701, emi: 0, netTotal: 103635 },
  { month: 'May-25', entertainment: 1017, family: 29781, home: 30700, personalAndShopping: 38791, travel: 4661, totalExpense: 104950, investment: 42035, emi: 0, netTotal: 146985 },
  { month: 'Jun-25', entertainment: 467, family: 25132, home: 37034, personalAndShopping: 1642, travel: 4323, totalExpense: 68598, investment: 21732, emi: 0, netTotal: 90330 },
  { month: 'Jul-25', entertainment: 467, family: 3955, home: 103152, personalAndShopping: 6758, travel: 4278, totalExpense: 118610, investment: 21732, emi: 0, netTotal: 140342 },
  { month: 'Aug-25', entertainment: 467, family: 9238, home: 50416, personalAndShopping: 12231, travel: 9563, totalExpense: 81915, investment: 120920, emi: 0, netTotal: 202835 },
  { month: 'Sep-25', entertainment: 467, family: 43030, home: 46016, personalAndShopping: 31960, travel: 8556, totalExpense: 130029, investment: 28554, emi: 0, netTotal: 158583 },
  { month: 'Oct-25', entertainment: 467, family: 63904, home: 35331, personalAndShopping: 42621, travel: 2537, totalExpense: 144860, investment: 15706, emi: 0, netTotal: 160566 },
];

/**
 * Clean Zero Slate for Investments: All 15 months set strictly to ₹0.00
 */
export const ZERO_INVESTMENT_SNAPSHOTS: MonthlyInvestmentSnapshot[] = [
  'Sep-24', 'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25', 'Aug-25', 'Sep-25', 'Oct-25', 'Nov-25',
].map((month) => ({
  month,
  ppf: 0,
  epfo: 0,
  nps: 0,
  equity: 0,
  etf: 0,
  mf: 0,
  usEquity: 0,
  fds: 0,
  total: 0,
  changePercent: 0,
}));

/**
 * Clean Zero Slate for Expenses: All 23 months set strictly to ₹0.00
 */
export const ZERO_EXPENSE_SNAPSHOTS: MonthlyExpenseVsInvestmentSnapshot[] = [
  'Dec-23', 'Jan-24', 'Feb-24', 'Mar-24', 'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24', 'Oct-24', 'Nov-24',
  'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25', 'Apr-25', 'May-25', 'Jun-25', 'Jul-25', 'Aug-25', 'Sep-25', 'Oct-25',
].map((month) => ({
  month,
  entertainment: 0,
  family: 0,
  home: 0,
  personalAndShopping: 0,
  travel: 0,
  totalExpense: 0,
  investment: 0,
  emi: 0,
  netTotal: 0,
}));

const STORAGE_INVESTMENT_KEY = 'my_finance_historical_investments_v3';
const STORAGE_EXPENSE_KEY = 'my_finance_historical_expenses_v3';

/**
 * Loads historical investments.
 * Defaults to ZERO_INVESTMENT_SNAPSHOTS (clean ₹0.00 state)
 */
export function loadHistoricalInvestments(): MonthlyInvestmentSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_INVESTMENT_KEY);
    if (!raw) return ZERO_INVESTMENT_SNAPSHOTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ZERO_INVESTMENT_SNAPSHOTS;
  } catch (e) {
    return ZERO_INVESTMENT_SNAPSHOTS;
  }
}

export function saveHistoricalInvestments(data: MonthlyInvestmentSnapshot[]) {
  try {
    localStorage.setItem(STORAGE_INVESTMENT_KEY, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Loads historical expenses.
 * Defaults to ZERO_EXPENSE_SNAPSHOTS (clean ₹0.00 state)
 */
export function loadHistoricalExpenses(): MonthlyExpenseVsInvestmentSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_EXPENSE_KEY);
    if (!raw) return ZERO_EXPENSE_SNAPSHOTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : ZERO_EXPENSE_SNAPSHOTS;
  } catch (e) {
    return ZERO_EXPENSE_SNAPSHOTS;
  }
}

export function saveHistoricalExpenses(data: MonthlyExpenseVsInvestmentSnapshot[]) {
  try {
    localStorage.setItem(STORAGE_EXPENSE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function resetHistoricalDataToZero() {
  saveHistoricalInvestments(ZERO_INVESTMENT_SNAPSHOTS);
  saveHistoricalExpenses(ZERO_EXPENSE_SNAPSHOTS);
}

export function loadDemoHistoricalSnapshots() {
  saveHistoricalInvestments(INITIAL_INVESTMENT_SNAPSHOTS);
  saveHistoricalExpenses(INITIAL_EXPENSE_VS_INVESTMENT_SNAPSHOTS);
}
