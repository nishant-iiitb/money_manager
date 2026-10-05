import { Transaction, CustomCategory } from '../types/finance';

// Common Indian retail and personal finance keywords mapped to default category names
const KEYWORD_MAP: Record<string, string[]> = {
  Travel: [
    'fuel', 'petrol', 'diesel', 'taxi', 'cab', 'uber', 'ola', 'rapido', 'metro', 'train',
    'irctc', 'flight', 'indigo', 'air india', 'fastag', 'toll', 'parking', 'auto', 'bus'
  ],
  'Food & Dining': [
    'burger', 'pizza', 'swiggy', 'zomato', 'restaurant', 'cafe', 'starbucks', 'chai', 'tea',
    'coffee', 'mcdonalds', 'kfc', 'dominos', 'biryani', 'dinner', 'lunch', 'breakfast', 'snack'
  ],
  Home: [
    'maid', 'cook', 'food maid', 'grocery', 'vegetables', 'milk', 'cylinder', 'gas',
    'cookware', 'cleaning', 'plumber', 'electrician', 'rent', 'carpenter', 'society',
    'maintenance', 'blinkit', 'zepto', 'instamart', 'bb daily', 'bigbasket'
  ],
  Stuti: [
    'cake', 'birthday', 'bouquet', 'flowers', 'stuti', 'anniversary', 'party', 'outing'
  ],
  Personal: [
    'salon', 'haircut', 'spa', 'massage', 'cosmetics', 'perfume', 'clothes', 'barber',
    'misc', 'grooming', 'shoes', 'watch'
  ],
  Family: [
    'gift', 'sirjan', 'mom', 'dad', 'brother', 'sister', 'parents', 'family', 'relatives',
    'festival', 'diwali', 'rakhi'
  ],
  Shopping: [
    'amazon', 'flipkart', 'myntra', 'ajio', 'zara', 'h&m', 'electronics', 'gadget',
    'croma', 'reliance digital', 'apple', 'charger'
  ],
  'Bills & Utilities': [
    'electricity', 'power', 'water', 'wifi', 'broadband', 'airtel', 'jio', 'vi',
    'mobile recharge', 'dth', 'tata play', 'piped gas', 'bill'
  ],
  'Health & Medical': [
    'doctor', 'hospital', 'medicine', 'pharmacy', 'apollo', '1mg', 'pharmeasy',
    'clinic', 'dentist', 'lab test', 'scan'
  ],
  Investment: [
    'mutual fund', 'sip', 'zerodha', 'groww', 'shares', 'stocks', 'ppf', 'nps', 'rd', 'fd'
  ]
};

export interface CategorySuggestion {
  category: string;
  confidence: number; // 0 to 1
  matchedReason: string;
  matchedFromHistory?: boolean;
}

/**
 * Suggests the best category for a given item description based on:
 * 1. Historical transaction matches (highest priority)
 * 2. Keyword dictionary match
 * 3. Available custom & default categories
 */
export function suggestCategory(
  itemQuery: string,
  history: Transaction[],
  categories: CustomCategory[]
): CategorySuggestion | null {
  const query = itemQuery.trim().toLowerCase();
  if (!query) return null;

  // 1. Exact or close match in transaction history
  const historyCounts: Record<string, number> = {};
  for (const tx of history) {
    if (!tx.item) continue;
    const itemLower = tx.item.toLowerCase();
    
    // Exact match
    if (itemLower === query) {
      historyCounts[tx.category] = (historyCounts[tx.category] || 0) + 10;
    }
    // Substring match
    else if (itemLower.includes(query) || query.includes(itemLower)) {
      historyCounts[tx.category] = (historyCounts[tx.category] || 0) + 4;
    }
    // Word token match
    else {
      const qTokens = query.split(/\s+/);
      const itemTokens = itemLower.split(/\s+/);
      const hasCommon = qTokens.some(t => t.length > 2 && itemTokens.includes(t));
      if (hasCommon) {
        historyCounts[tx.category] = (historyCounts[tx.category] || 0) + 2;
      }
    }
  }

  // Find top from history if exists
  let topCategory: string | null = null;
  let maxCount = 0;
  for (const [cat, count] of Object.entries(historyCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topCategory = cat;
    }
  }

  if (topCategory && maxCount >= 2) {
    return {
      category: topCategory,
      confidence: Math.min(0.98, 0.6 + maxCount * 0.05),
      matchedReason: `Matched past "${itemQuery}" entries`,
      matchedFromHistory: true,
    };
  }

  // 2. Keyword map check
  for (const [catName, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (query.includes(kw) || kw.includes(query)) {
        // Validate if this category exists or has similar custom category
        const matchedCategory = categories.find(
          c => c.name.toLowerCase() === catName.toLowerCase() ||
               c.name.toLowerCase().includes(catName.toLowerCase())
        );
        return {
          category: matchedCategory ? matchedCategory.name : catName,
          confidence: 0.85,
          matchedReason: `Keyword pattern: "${kw}"`,
          matchedFromHistory: false,
        };
      }
    }
  }

  // 3. Check if query matches any category name directly
  const directCat = categories.find(c => c.name.toLowerCase().includes(query) || query.includes(c.name.toLowerCase()));
  if (directCat) {
    return {
      category: directCat.name,
      confidence: 0.75,
      matchedReason: `Category name match`,
      matchedFromHistory: false,
    };
  }

  return null;
}

/**
 * Returns top 5 frequently used item descriptions for quick-chips in UI
 */
export function getFrequentItems(history: Transaction[]): { item: string; category: string }[] {
  const counts: Record<string, { count: number; category: string }> = {};
  for (const tx of history) {
    if (!tx.item) continue;
    const key = tx.item.trim();
    if (!counts[key]) {
      counts[key] = { count: 0, category: tx.category };
    }
    counts[key].count += 1;
  }

  return Object.entries(counts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([item, info]) => ({ item, category: info.category }));
}
