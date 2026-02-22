'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Expense, ExpenseFilters, Category } from '@/types/expense';
import { loadExpenses, saveExpenses, clearExpenses } from '@/utils/storage';
import { generateSampleData } from '@/utils/sampleData';
import {
  getMonthStart,
  getMonthEnd,
  getYearStart,
  getTodayString,
} from '@/utils/formatters';

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  category: 'All',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortOrder: 'desc',
  preset: 'all',
};

interface ExpenseContextType {
  expenses: Expense[];
  filters: ExpenseFilters;
  filteredExpenses: Expense[];
  addExpense: (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteExpense: (id: string) => void;
  setFilters: (partial: Partial<ExpenseFilters>) => void;
  resetFilters: () => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  isLoaded: boolean;
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const ExpenseContext = createContext<ExpenseContextType | null>(null);

function applyPreset(preset: ExpenseFilters['preset']): { dateFrom: string; dateTo: string } {
  const today = getTodayString();
  switch (preset) {
    case 'thisMonth':
      return { dateFrom: getMonthStart(0), dateTo: getMonthEnd(0) };
    case 'lastMonth':
      return { dateFrom: getMonthStart(-1), dateTo: getMonthEnd(-1) };
    case 'last3Months':
      return { dateFrom: getMonthStart(-2), dateTo: today };
    case 'thisYear':
      return { dateFrom: getYearStart(), dateTo: today };
    default:
      return { dateFrom: '', dateTo: '' };
  }
}

function applyFilters(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  let result = [...expenses];

  const { dateFrom, dateTo } =
    filters.preset === 'custom' || filters.preset === 'all'
      ? { dateFrom: filters.dateFrom, dateTo: filters.dateTo }
      : applyPreset(filters.preset);

  if (dateFrom) result = result.filter((e) => e.date >= dateFrom);
  if (dateTo) result = result.filter((e) => e.date <= dateTo);

  if (filters.category !== 'All') {
    result = result.filter((e) => e.category === filters.category);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }

  result.sort((a, b) => {
    let cmp = 0;
    if (filters.sortBy === 'date') cmp = a.date.localeCompare(b.date);
    else if (filters.sortBy === 'amount') cmp = a.amount - b.amount;
    else if (filters.sortBy === 'category') cmp = a.category.localeCompare(b.category);
    return filters.sortOrder === 'desc' ? -cmp : cmp;
  });

  return result;
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFiltersState] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const saved = loadExpenses();
    setExpenses(saved);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) saveExpenses(expenses);
  }, [expenses, isLoaded]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addExpense = useCallback(
    (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newExpense: Expense = {
        ...data,
        id: Math.random().toString(36).slice(2) + Date.now().toString(36),
        createdAt: now,
        updatedAt: now,
      };
      setExpenses((prev) => [newExpense, ...prev]);
      showToast('Expense added successfully');
    },
    [showToast]
  );

  const updateExpense = useCallback(
    (id: string, data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e
        )
      );
      showToast('Expense updated successfully');
    },
    [showToast]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      showToast('Expense deleted');
    },
    [showToast]
  );

  const setFilters = useCallback((partial: Partial<ExpenseFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const loadSampleData = useCallback(() => {
    const sample = generateSampleData();
    setExpenses(sample);
    showToast(`Loaded ${sample.length} sample expenses`);
  }, [showToast]);

  const clearAllData = useCallback(() => {
    clearExpenses();
    setExpenses([]);
    showToast('All expenses cleared');
  }, [showToast]);

  const filteredExpenses = applyFilters(expenses, filters);

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        filters,
        filteredExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        setFilters,
        resetFilters,
        loadSampleData,
        clearAllData,
        isLoaded,
        toast,
        showToast,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses(): ExpenseContextType {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
