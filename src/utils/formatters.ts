/**
 * Format number in Indian Rupee format (e.g., ₹ 1,62,121.00)
 */
export function formatINR(amount: number | null | undefined, showDecimals: boolean = true): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹ 0.00';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}₹ ${formatted}`;
}

/**
 * Format compact INR for small badges or chart labels (e.g. ₹42.2L, ₹15.3K)
 */
export function formatCompactINR(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (abs >= 10000000) {
    return `${isNegative ? '-' : ''}₹${(abs / 10000000).toFixed(2)}Cr`;
  }
  if (abs >= 100000) {
    return `${isNegative ? '-' : ''}₹${(abs / 100000).toFixed(2)}L`;
  }
  if (abs >= 1000) {
    return `${isNegative ? '-' : ''}₹${(abs / 1000).toFixed(1)}K`;
  }
  return `${isNegative ? '-' : ''}₹${abs.toFixed(0)}`;
}

/**
 * Format date to DD-MM-YYYY (like user's Excel sheet)
 */
export function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    // YYYY-MM-DD -> DD-MM-YYYY
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Format percentage (e.g. 0.38%)
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Get current date as YYYY-MM-DD in local time
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday date as YYYY-MM-DD
 */
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
