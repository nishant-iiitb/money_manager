import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FinanceData,
  Transaction,
  BankAccount,
  CreditCard,
  CreditCardPool,
  RecurringCommitment,
  MonthlyHouseholdBudget,
  CustomCategory,
  FinancialGoal,
  InvestmentEntry,
  CustomAsset,
  CustomLiability,
  PersonLendingRecord,
  PersonSettlement,
} from '../types/finance';
import {
  loadFinanceData,
  saveFinanceData,
  resetToInitialData,
  resetToZeroSlate,
  loadDemoExcelData,
} from '../utils/storage';

export interface CalculatedAccount extends BankAccount {
  currentBalance: number;
  totalIncome: number;
  totalExpense: number;
}

export interface CalculatedCard extends CreditCard {
  currentLiability: number;
  unbilledAmount: number;
  effectiveLimit: number;
  effectiveAvailableLimit: number;
  effectiveUtilization: number;
  poolName?: string;
}

export interface CalculatedPool extends CreditCardPool {
  currentPoolLiability: number;
  availablePoolLimit: number;
  poolUtilization: number;
  cards: CalculatedCard[];
}

export function useFinanceStore() {
  const [data, setData] = useState<FinanceData>(() => loadFinanceData());

  // Save changes automatically
  const updateData = useCallback((updater: (prev: FinanceData) => FinanceData) => {
    setData((prev) => {
      const next = updater(prev);
      saveFinanceData(next);
      return next;
    });
  }, []);

  // Sync if another tab or window modifies storage
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'my_finance_manager_v2' && e.newValue) {
        try {
          setData(JSON.parse(e.newValue));
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ==========================================
  // CALCULATIONS: Bank Accounts Real-Time Balances
  // ==========================================
  const calculatedAccounts: CalculatedAccount[] = useMemo(() => {
    return data.accounts.map((acct) => {
      let incomeSum = 0;
      let expenseSum = 0;

      for (const tx of data.transactions) {
        if (tx.accountId === acct.id) {
          if (tx.type === 'expense' || tx.type === 'card_payment') {
            expenseSum += tx.amount;
          } else if (tx.type === 'income') {
            incomeSum += tx.amount;
          } else if (tx.type === 'transfer') {
            expenseSum += tx.amount;
          }
        }
        // If transfer destination is this account
        if (tx.destinationAccountId === acct.id && tx.type === 'transfer') {
          incomeSum += tx.amount;
        }
      }

      const currentBalance = acct.initialBalance + incomeSum - expenseSum;

      return {
        ...acct,
        currentBalance,
        totalIncome: incomeSum,
        totalExpense: expenseSum,
      };
    });
  }, [data.accounts, data.transactions]);

  // Total savings balance
  const totalSavingsBalance = useMemo(() => {
    return calculatedAccounts
      .filter((a) => a.accountType === 'savings' || a.accountType === 'salary')
      .reduce((sum, a) => sum + a.currentBalance, 0);
  }, [calculatedAccounts]);

  const totalWalletsBalance = useMemo(() => {
    return calculatedAccounts
      .filter((a) => a.accountType === 'wallet' || a.accountType === 'food_card')
      .reduce((sum, a) => sum + a.currentBalance, 0);
  }, [calculatedAccounts]);

  // ==========================================
  // CALCULATIONS: Credit Cards & Shared Pools
  // ==========================================
  const calculatedCardsAndPools = useMemo(() => {
    // 1. Calculate each card's direct liability
    const rawCardLiabilities: Record<string, { totalCharged: number; totalPaid: number }> = {};
    for (const card of data.creditCards) {
      rawCardLiabilities[card.id] = { totalCharged: 0, totalPaid: 0 };
    }

    for (const tx of data.transactions) {
      // Direct expense charged to credit card
      if (tx.accountId in rawCardLiabilities && tx.type === 'expense') {
        rawCardLiabilities[tx.accountId].totalCharged += tx.amount;
      }
      // Card payment made to credit card
      if (tx.destinationAccountId && tx.destinationAccountId in rawCardLiabilities && tx.type === 'card_payment') {
        rawCardLiabilities[tx.destinationAccountId].totalPaid += tx.amount;
      }
    }

    // 2. Sum liabilities per pool
    const poolLiabilities: Record<string, number> = {};
    for (const pool of data.cardPools) {
      poolLiabilities[pool.id] = 0;
    }

    const calculatedCardsMap: Record<string, CalculatedCard> = {};

    for (const card of data.creditCards) {
      const charged = rawCardLiabilities[card.id]?.totalCharged || 0;
      const paid = rawCardLiabilities[card.id]?.totalPaid || 0;
      const currentLiability = Math.max(0, card.initialLiability + charged - paid);
      const unbilledAmount = Math.max(0, currentLiability - (card.billedAmount || 0));

      if (card.poolId && card.poolId in poolLiabilities) {
        poolLiabilities[card.poolId] += currentLiability;
      }

      calculatedCardsMap[card.id] = {
        ...card,
        currentLiability,
        unbilledAmount,
        effectiveLimit: card.standaloneLimit || 0,
        effectiveAvailableLimit: Math.max(0, (card.standaloneLimit || 0) - currentLiability),
        effectiveUtilization:
          card.standaloneLimit && card.standaloneLimit > 0
            ? (currentLiability / card.standaloneLimit) * 100
            : 0,
      };
    }

    // 3. Build Pools with attached cards
    const pools: CalculatedPool[] = data.cardPools.map((pool) => {
      const currentPoolLiability = poolLiabilities[pool.id] || 0;
      const availablePoolLimit = Math.max(0, pool.totalLimit - currentPoolLiability);
      const poolUtilization = pool.totalLimit > 0 ? (currentPoolLiability / pool.totalLimit) * 100 : 0;

      const memberCards: CalculatedCard[] = data.creditCards
        .filter((c) => c.poolId === pool.id)
        .map((c) => {
          const base = calculatedCardsMap[c.id];
          return {
            ...base,
            poolName: pool.name,
            effectiveLimit: pool.totalLimit,
            effectiveAvailableLimit: availablePoolLimit,
            effectiveUtilization: poolUtilization,
          };
        });

      return {
        ...pool,
        currentPoolLiability,
        availablePoolLimit,
        poolUtilization,
        cards: memberCards,
      };
    });

    // 4. Standalone cards (not in any pool)
    const standaloneCards: CalculatedCard[] = data.creditCards
      .filter((c) => !c.poolId)
      .map((c) => calculatedCardsMap[c.id]);

    // 5. Total CC stats across all cards
    const totalLiabilities = Object.values(calculatedCardsMap).reduce(
      (sum, c) => sum + c.currentLiability,
      0
    );

    // Sum limits: sum of all pool limits + standalone card limits
    const totalLimits =
      data.cardPools.reduce((sum, p) => sum + p.totalLimit, 0) +
      standaloneCards.reduce((sum, c) => sum + (c.standaloneLimit || 0), 0);

    const totalAvailableLimit = Math.max(0, totalLimits - totalLiabilities);
    const overallUtilization = totalLimits > 0 ? (totalLiabilities / totalLimits) * 100 : 0;

    return {
      allCalculatedCards: Object.values(calculatedCardsMap),
      pools,
      standaloneCards,
      totalLiabilities,
      totalLimits,
      totalAvailableLimit,
      overallUtilization,
    };
  }, [data.creditCards, data.cardPools, data.transactions]);

  // ==========================================
  // CALCULATIONS: Assets, Liabilities & Net Worth (with P2P Lending)
  // ==========================================
  const netWorthSummary = useMemo(() => {
    const bankAssets = totalSavingsBalance + totalWalletsBalance;
    const investmentsAssets = (data.investments || []).reduce((sum, inv) => sum + (inv.currentAmount || 0), 0);
    const customAssetsTotal = (data.customAssets || []).reduce((sum, a) => sum + a.value, 0);

    // Person-to-person Lending (Asset: Money lent to others, receivable)
    const personalLendingAssets = (data.personLending || [])
      .filter((p) => p.type === 'lent' && !p.settled)
      .reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

    const totalAssets = bankAssets + investmentsAssets + customAssetsTotal + personalLendingAssets;

    const ccLiabilities = calculatedCardsAndPools.totalLiabilities;
    const customLiabilitiesTotal = (data.customLiabilities || []).reduce((sum, l) => sum + l.value, 0);

    // Person-to-person Borrowing (Liability: Money borrowed from others, payable)
    const personalBorrowingLiabilities = (data.personLending || [])
      .filter((p) => p.type === 'borrowed' && !p.settled)
      .reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

    const totalLiabilities = ccLiabilities + customLiabilitiesTotal + personalBorrowingLiabilities;
    const netWorth = totalAssets - totalLiabilities;

    // Excel Final Calculation matches
    const totalNeeded = data.accounts.reduce((sum, a) => sum + (a.neededMonthly || 0), 0);
    const remainingCashflow = bankAssets - totalNeeded;

    return {
      bankAssets,
      investmentsAssets,
      customAssetsTotal,
      personalLendingAssets,
      totalAssets,
      ccLiabilities,
      customLiabilitiesTotal,
      personalBorrowingLiabilities,
      totalLiabilities,
      netWorth,
      totalNeeded,
      remainingCashflow,
    };
  }, [
    totalSavingsBalance,
    totalWalletsBalance,
    data.investments,
    data.customAssets,
    data.customLiabilities,
    data.personLending,
    data.accounts,
    calculatedCardsAndPools.totalLiabilities,
  ]);

  // ==========================================
  // ACTION DISPATCHERS
  // ==========================================

  // Transactions
  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
      const newTx: Transaction = {
        ...tx,
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
      };

      updateData((prev) => ({
        ...prev,
        transactions: [newTx, ...prev.transactions],
      }));
    },
    [updateData]
  );

  const updateTransaction = useCallback(
    (tx: Transaction) => {
      updateData((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) => (t.id === tx.id ? tx : t)),
      }));
    },
    [updateData]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t.id !== id),
      }));
    },
    [updateData]
  );

  // Bank Accounts
  const addAccount = useCallback(
    (account: Omit<BankAccount, 'id'>) => {
      const newAccount: BankAccount = {
        ...account,
        id: `acc-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        accounts: [...prev.accounts, newAccount],
      }));
    },
    [updateData]
  );

  const updateAccount = useCallback(
    (account: BankAccount) => {
      updateData((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) => (a.id === account.id ? account : a)),
      }));
    },
    [updateData]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((a) => a.id !== id),
      }));
    },
    [updateData]
  );

  // Reconcile / set latest verified balance for an account
  const reconcileAccountBalance = useCallback(
    (accountId: string, newBalance: number) => {
      updateData((prev) => {
        const target = prev.accounts.find((a) => a.id === accountId);
        if (!target) return prev;

        let incomeSum = 0;
        let expenseSum = 0;
        for (const tx of prev.transactions) {
          if (tx.accountId === accountId) {
            if (tx.type === 'expense' || tx.type === 'card_payment') expenseSum += tx.amount;
            else if (tx.type === 'income') incomeSum += tx.amount;
            else if (tx.type === 'transfer') expenseSum += tx.amount;
          }
          if (tx.destinationAccountId === accountId && tx.type === 'transfer') {
            incomeSum += tx.amount;
          }
        }

        const requiredInitial = newBalance - incomeSum + expenseSum;

        return {
          ...prev,
          accounts: prev.accounts.map((a) =>
            a.id === accountId ? { ...a, initialBalance: requiredInitial } : a
          ),
        };
      });
    },
    [updateData]
  );

  // Credit Cards
  const addCreditCard = useCallback(
    (card: Omit<CreditCard, 'id'>) => {
      const newCard: CreditCard = {
        ...card,
        id: `cc-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        creditCards: [...prev.creditCards, newCard],
      }));
    },
    [updateData]
  );

  const updateCreditCard = useCallback(
    (card: CreditCard) => {
      updateData((prev) => ({
        ...prev,
        creditCards: prev.creditCards.map((c) => (c.id === card.id ? card : c)),
      }));
    },
    [updateData]
  );

  const deleteCreditCard = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        creditCards: prev.creditCards.filter((c) => c.id !== id),
      }));
    },
    [updateData]
  );

  // Card Pools
  const addCardPool = useCallback(
    (pool: Omit<CreditCardPool, 'id'>) => {
      const newPool: CreditCardPool = {
        ...pool,
        id: `pool-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        cardPools: [...prev.cardPools, newPool],
      }));
    },
    [updateData]
  );

  const updateCardPool = useCallback(
    (pool: CreditCardPool) => {
      updateData((prev) => ({
        ...prev,
        cardPools: prev.cardPools.map((p) => (p.id === pool.id ? pool : p)),
      }));
    },
    [updateData]
  );

  const deleteCardPool = useCallback(
    (poolId: string) => {
      updateData((prev) => ({
        ...prev,
        cardPools: prev.cardPools.filter((p) => p.id !== poolId),
        creditCards: prev.creditCards.map((c) =>
          c.poolId === poolId ? { ...c, poolId: undefined } : c
        ),
      }));
    },
    [updateData]
  );

  // Record a payment towards a credit card from a bank account
  const recordCardPayment = useCallback(
    (params: {
      fromAccountId: string;
      toCardId: string;
      amount: number;
      date: string;
      notes?: string;
    }) => {
      const card = data.creditCards.find((c) => c.id === params.toCardId);
      const cardName = card ? card.name : 'Credit Card';

      addTransaction({
        date: params.date,
        category: 'Bills & Utilities',
        item: `CC Bill Payment: ${cardName}`,
        amount: params.amount,
        type: 'card_payment',
        accountId: params.fromAccountId,
        destinationAccountId: params.toCardId,
        notes: params.notes,
      });
    },
    [data.creditCards, addTransaction]
  );

  // Categories
  const addCategory = useCallback(
    (cat: Omit<CustomCategory, 'id'>) => {
      const newCat: CustomCategory = {
        ...cat,
        id: `cat-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        categories: [...prev.categories, newCat],
      }));
    },
    [updateData]
  );

  const updateCategory = useCallback(
    (cat: CustomCategory) => {
      updateData((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === cat.id ? cat : c)),
      }));
    },
    [updateData]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      }));
    },
    [updateData]
  );

  // Goals
  const addGoal = useCallback(
    (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => {
      const newGoal: FinancialGoal = {
        ...goal,
        id: `goal-${Date.now()}`,
        createdAt: Date.now(),
      };
      updateData((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
      }));
    },
    [updateData]
  );

  const updateGoal = useCallback(
    (goal: FinancialGoal) => {
      updateData((prev) => ({
        ...prev,
        goals: prev.goals.map((g) => (g.id === goal.id ? goal : g)),
      }));
    },
    [updateData]
  );

  const deleteGoal = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        goals: prev.goals.filter((g) => g.id !== id),
      }));
    },
    [updateData]
  );

  const allocateFundsToGoal = useCallback(
    (goalId: string, amount: number, fromAccountId?: string) => {
      updateData((prev) => {
        let updatedTx = prev.transactions;
        if (fromAccountId && amount > 0) {
          const targetGoal = prev.goals.find((g) => g.id === goalId);
          const goalTitle = targetGoal ? targetGoal.title : 'Goal';
          const newTx: Transaction = {
            id: `tx-goal-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            category: 'Investment',
            item: `Goal Contribution: ${goalTitle}`,
            amount,
            type: 'expense',
            accountId: fromAccountId,
            createdAt: Date.now(),
          };
          updatedTx = [newTx, ...prev.transactions];
        }

        return {
          ...prev,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, savedAmount: Math.max(0, g.savedAmount + amount) } : g
          ),
          transactions: updatedTx,
        };
      });
    },
    [updateData]
  );

  // Commitments (Insurance, EMIs, Subscriptions)
  const addCommitment = useCallback(
    (commitment: Omit<RecurringCommitment, 'id'>) => {
      const newCommitment: RecurringCommitment = {
        ...commitment,
        id: `com-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        commitments: [...prev.commitments, newCommitment],
      }));
    },
    [updateData]
  );

  const updateCommitment = useCallback(
    (commitment: RecurringCommitment) => {
      updateData((prev) => ({
        ...prev,
        commitments: prev.commitments.map((c) => (c.id === commitment.id ? commitment : c)),
      }));
    },
    [updateData]
  );

  const deleteCommitment = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        commitments: prev.commitments.filter((c) => c.id !== id),
      }));
    },
    [updateData]
  );

  // Household Budgets
  const updateHouseholdBudget = useCallback(
    (id: string, actualAmount: number, plannedAmount: number) => {
      updateData((prev) => ({
        ...prev,
        householdBudgets: prev.householdBudgets.map((b) =>
          b.id === id ? { ...b, actualAmount, plannedAmount } : b
        ),
      }));
    },
    [updateData]
  );

  const addHouseholdBudget = useCallback(
    (budget: Omit<MonthlyHouseholdBudget, 'id'>) => {
      const newBudget: MonthlyHouseholdBudget = {
        ...budget,
        id: `hb-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        householdBudgets: [...prev.householdBudgets, newBudget],
      }));
    },
    [updateData]
  );

  // Investments
  const updateInvestment = useCallback(
    (id: string, currentAmount: number, proposedAmount: number) => {
      updateData((prev) => ({
        ...prev,
        investments: prev.investments.map((inv) =>
          inv.id === id ? { ...inv, currentAmount, proposedAmount } : inv
        ),
      }));
    },
    [updateData]
  );

  const addInvestment = useCallback(
    (inv: Omit<InvestmentEntry, 'id'>) => {
      const newInv: InvestmentEntry = {
        ...inv,
        id: `inv-${Date.now()}`,
      };
      updateData((prev) => ({
        ...prev,
        investments: [...prev.investments, newInv],
      }));
    },
    [updateData]
  );

  // ==========================================
  // PERSON TO PERSON: Borrow & Lending (Assets & Liabilities)
  // ==========================================
  const addPersonRecord = useCallback(
    (
      record: Omit<
        PersonLendingRecord,
        'id' | 'createdAt' | 'remainingAmount' | 'settled' | 'settlements'
      > & { logToBank?: boolean }
    ) => {
      const newRecord: PersonLendingRecord = {
        personName: record.personName,
        type: record.type,
        originalAmount: record.originalAmount,
        remainingAmount: record.originalAmount,
        date: record.date,
        dueDate: record.dueDate,
        notes: record.notes,
        accountId: record.accountId,
        settled: false,
        settlements: [],
        id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };

      updateData((prev) => {
        let updatedTx = prev.transactions;
        if (record.logToBank && record.accountId) {
          // If I lent money: money left bank account (expense)
          // If I borrowed money: money entered bank account (income)
          const isLent = record.type === 'lent';
          const newTx: Transaction = {
            id: `tx-p2p-${Date.now()}`,
            date: record.date,
            category: 'Personal',
            item: `P2P ${isLent ? 'Lent to' : 'Borrowed from'}: ${record.personName}`,
            amount: record.originalAmount,
            type: isLent ? 'expense' : 'income',
            accountId: record.accountId,
            notes: record.notes,
            createdAt: Date.now(),
          };
          updatedTx = [newTx, ...updatedTx];
        }

        return {
          ...prev,
          personLending: [newRecord, ...(prev.personLending || [])],
          transactions: updatedTx,
        };
      });
    },
    [updateData]
  );

  const recordPersonSettlement = useCallback(
    (
      recordId: string,
      settlement: { amount: number; date: string; notes?: string; accountId?: string; logToBank?: boolean }
    ) => {
      updateData((prev) => {
        const target = prev.personLending?.find((r) => r.id === recordId);
        if (!target) return prev;

        const newSettlement: PersonSettlement = {
          id: `set-${Date.now()}`,
          date: settlement.date,
          amount: settlement.amount,
          notes: settlement.notes,
          accountId: settlement.accountId,
        };

        const updatedSettlements = [...target.settlements, newSettlement];
        const totalSettled = updatedSettlements.reduce((sum, s) => sum + s.amount, 0);
        const remainingAmount = Math.max(0, target.originalAmount - totalSettled);
        const settled = remainingAmount === 0;

        const updatedRecords = (prev.personLending || []).map((r) =>
          r.id === recordId
            ? {
                ...r,
                remainingAmount,
                settled,
                settlements: updatedSettlements,
              }
            : r
        );

        let updatedTx = prev.transactions;
        if (settlement.logToBank && settlement.accountId) {
          // When Lent is settled: you receive money back (income into bank)
          // When Borrowed is settled: you pay money back (expense from bank)
          const isLent = target.type === 'lent';
          const newTx: Transaction = {
            id: `tx-p2p-settle-${Date.now()}`,
            date: settlement.date,
            category: 'Personal',
            item: `P2P Settlement (${isLent ? 'Received' : 'Repaid'}): ${target.personName}`,
            amount: settlement.amount,
            type: isLent ? 'income' : 'expense',
            accountId: settlement.accountId,
            notes: settlement.notes,
            createdAt: Date.now(),
          };
          updatedTx = [newTx, ...updatedTx];
        }

        return {
          ...prev,
          personLending: updatedRecords,
          transactions: updatedTx,
        };
      });
    },
    [updateData]
  );

  const updatePersonRecord = useCallback(
    (id: string, updates: Partial<PersonLendingRecord>) => {
      updateData((prev) => ({
        ...prev,
        personLending: (prev.personLending || []).map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }));
    },
    [updateData]
  );

  const deletePersonRecord = useCallback(
    (id: string) => {
      updateData((prev) => ({
        ...prev,
        personLending: (prev.personLending || []).filter((r) => r.id !== id),
      }));
    },
    [updateData]
  );

  // Reset to initial dummy data (or clean 0 slate)
  const resetToExcelDefaults = useCallback(() => {
    const fresh = resetToInitialData();
    setData(fresh);
  }, []);

  const resetToZero = useCallback(() => {
    const fresh = resetToZeroSlate();
    setData(fresh);
  }, []);

  const loadDemoData = useCallback(() => {
    const demo = loadDemoExcelData();
    setData(demo);
  }, []);

  // Full import
  const importData = useCallback((imported: FinanceData) => {
    setData(imported);
    saveFinanceData(imported);
  }, []);

  return {
    data,
    calculatedAccounts,
    calculatedCardsAndPools,
    totalSavingsBalance,
    totalWalletsBalance,
    netWorthSummary,

    // Methods
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    reconcileAccountBalance,
    addCreditCard,
    updateCreditCard,
    deleteCreditCard,
    addCardPool,
    updateCardPool,
    deleteCardPool,
    recordCardPayment,
    addCategory,
    updateCategory,
    deleteCategory,
    addGoal,
    updateGoal,
    deleteGoal,
    allocateFundsToGoal,
    addCommitment,
    updateCommitment,
    deleteCommitment,
    updateHouseholdBudget,
    addHouseholdBudget,
    updateInvestment,
    addInvestment,

    // Person to person lending
    addPersonRecord,
    recordPersonSettlement,
    updatePersonRecord,
    deletePersonRecord,

    // Data reset & restore
    resetToExcelDefaults,
    resetToZero,
    loadDemoData,
    importData,
  };
}
