export interface MonthlyInvestmentSnapshot {
  month: string; // e.g. "Sep-24", "Oct-24"
  ppf: number;
  epfo: number;
  nps: number;
  equity: number;
  etf: number;
  mf: number;
  usEquity: number;
  fds: number;
  total: number;
  changePercent?: number; // e.g. 3.469
}

export interface MonthlyExpenseSnapshot {
  month: string; // e.g. "Dec-23", "Jan-24"
  entertainment: number;
  family: number;
  home: number;
  personalAndShopping: number;
  travel: number;
  totalExpense: number;
}

export interface MonthlyExpenseVsInvestmentSnapshot extends MonthlyExpenseSnapshot {
  investment: number;
  emi: number;
  netTotal: number;
}
