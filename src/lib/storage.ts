import { Expense, Budget, DEFAULT_BUDGETS } from '@/types/expense';

const EXPENSES_KEY = 'spill:expenses';
const BUDGETS_KEY = 'spill:budgets';

export function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

export function loadBudgets(): Budget {
  if (typeof window === 'undefined') return { ...DEFAULT_BUDGETS };
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    return raw ? { ...DEFAULT_BUDGETS, ...JSON.parse(raw) } : { ...DEFAULT_BUDGETS };
  } catch {
    return { ...DEFAULT_BUDGETS };
  }
}

export function saveBudgets(budgets: Budget): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}
