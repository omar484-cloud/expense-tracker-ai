import { Expense, Category, CATEGORIES } from '@/types/expense';
import { getMonthStart, getMonthEnd, getTodayString } from './formatters';

export interface CategorySummary {
  category: Category;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTotal {
  month: string; // YYYY-MM
  label: string;
  total: number;
}

export interface ExpenseStats {
  totalAll: number;
  totalThisMonth: number;
  totalLastMonth: number;
  monthlyChange: number; // percentage
  avgPerDay: number;
  topCategory: Category | null;
  topCategoryAmount: number;
  expenseCount: number;
}

function isInRange(dateStr: string, from: string, to: string): boolean {
  return dateStr >= from && dateStr <= to;
}

export function getStats(expenses: Expense[]): ExpenseStats {
  const thisMonthStart = getMonthStart(0);
  const thisMonthEnd = getMonthEnd(0);
  const lastMonthStart = getMonthStart(-1);
  const lastMonthEnd = getMonthEnd(-1);
  const today = getTodayString();

  const totalAll = expenses.reduce((sum, e) => sum + e.amount, 0);

  const thisMonthExpenses = expenses.filter((e) =>
    isInRange(e.date, thisMonthStart, thisMonthEnd)
  );
  const totalThisMonth = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const lastMonthExpenses = expenses.filter((e) =>
    isInRange(e.date, lastMonthStart, lastMonthEnd)
  );
  const totalLastMonth = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const monthlyChange =
    totalLastMonth === 0
      ? totalThisMonth > 0
        ? 100
        : 0
      : ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  // Days elapsed this month
  const currentDay = parseInt(today.split('-')[2]);
  const avgPerDay = currentDay > 0 ? totalThisMonth / currentDay : 0;

  // Top category by spending this month (fall back to all time)
  const source = thisMonthExpenses.length > 0 ? thisMonthExpenses : expenses;
  const categoryTotals = CATEGORIES.map((cat) => ({
    category: cat,
    total: source.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
  }));
  const top = categoryTotals.reduce(
    (best, cur) => (cur.total > best.total ? cur : best),
    { category: null as Category | null, total: 0 }
  );

  return {
    totalAll,
    totalThisMonth,
    totalLastMonth,
    monthlyChange,
    avgPerDay,
    topCategory: top.total > 0 ? top.category : null,
    topCategoryAmount: top.total,
    expenseCount: expenses.length,
  };
}

export function getCategoryBreakdown(expenses: Expense[]): CategorySummary[] {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return CATEGORIES.map((category) => {
    const catExpenses = expenses.filter((e) => e.category === category);
    const catTotal = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      category,
      total: catTotal,
      count: catExpenses.length,
      percentage: total > 0 ? (catTotal / total) * 100 : 0,
    };
  }).filter((c) => c.count > 0);
}

export function getMonthlyTotals(expenses: Expense[], months = 6): MonthlyTotal[] {
  const results: MonthlyTotal[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const key = `${year}-${month}`;
    const label = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(d);
    const total = expenses
      .filter((e) => e.date.startsWith(key))
      .reduce((sum, e) => sum + e.amount, 0);
    results.push({ month: key, label, total });
  }
  return results;
}
