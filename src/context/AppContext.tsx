'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Expense, Budget, Category, DEFAULT_BUDGETS } from '@/types/expense';
import { loadExpenses, saveExpenses, loadBudgets, saveBudgets } from '@/lib/storage';
import { ParseResult } from '@/lib/parser';

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface AppContextValue {
  expenses: Expense[];
  budgets: Budget;
  addExpense: (p: ParseResult) => void;
  addExpenses: (ps: ParseResult[]) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => void;
  deleteExpense: (id: string) => void;
  clearAll: () => void;
  updateBudget: (category: Category, amount: number) => void;
  getMonthExpenses: (year: number, month: number) => Expense[];
  getCategoryMonthTotal: (category: Category, year: number, month: number) => number;
  loaded: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget>({ ...DEFAULT_BUDGETS });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setExpenses(loadExpenses());
    setBudgets(loadBudgets());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveExpenses(expenses);
  }, [expenses, loaded]);

  useEffect(() => {
    if (loaded) saveBudgets(budgets);
  }, [budgets, loaded]);

  const sorted = useCallback((list: Expense[]) =>
    [...list].sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.createdAt.localeCompare(a.createdAt);
    }),
    [],
  );

  const addExpense = useCallback((p: ParseResult) => {
    if (p.amount === null) return;
    const e: Expense = {
      id: uid(),
      amount: p.amount,
      description: p.description,
      category: p.category,
      date: p.date.toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      raw: p.raw,
    };
    setExpenses(prev => sorted([e, ...prev]));
  }, [sorted]);

  const addExpenses = useCallback((ps: ParseResult[]) => {
    const newItems = ps
      .filter(p => p.amount !== null)
      .map(p => ({
        id: uid(),
        amount: p.amount!,
        description: p.description,
        category: p.category,
        date: p.date.toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
        raw: p.raw,
      }));
    setExpenses(prev => sorted([...newItems, ...prev]));
  }, [sorted]);

  const updateExpense = useCallback((id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>) => {
    setExpenses(prev => sorted(prev.map(e => (e.id === id ? { ...e, ...updates } : e))));
  }, [sorted]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const clearAll = useCallback(() => setExpenses([]), []);

  const updateBudget = useCallback((category: Category, amount: number) => {
    setBudgets(prev => ({ ...prev, [category]: amount }));
  }, []);

  const getMonthExpenses = useCallback((year: number, month: number) => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(prefix));
  }, [expenses]);

  const getCategoryMonthTotal = useCallback((category: Category, year: number, month: number) => {
    return getMonthExpenses(year, month)
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [getMonthExpenses]);

  return (
    <AppContext.Provider value={{
      expenses, budgets, addExpense, addExpenses,
      updateExpense, deleteExpense, clearAll, updateBudget,
      getMonthExpenses, getCategoryMonthTotal, loaded,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
