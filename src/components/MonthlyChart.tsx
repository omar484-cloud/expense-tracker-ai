'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { getMonthlyTotals } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';

export default function MonthlyChart() {
  const { expenses } = useExpenses();
  const months = getMonthlyTotals(expenses, 6);

  const maxTotal = Math.max(...months.map((m) => m.total), 1);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-5">Monthly Spending</h3>

      <div className="flex items-end gap-3 h-40">
        {months.map((m, i) => {
          const heightPct = (m.total / maxTotal) * 100;
          const isLast = i === months.length - 1;
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex flex-col items-center">
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {formatCurrency(m.total)}
                </div>
                {/* Bar */}
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isLast ? 'bg-indigo-500' : 'bg-indigo-200 group-hover:bg-indigo-300'
                  }`}
                  style={{
                    height: `${Math.max(heightPct, m.total > 0 ? 4 : 0)}%`,
                    minHeight: m.total > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <span
                className={`text-xs font-medium truncate max-w-full text-center ${
                  isLast ? 'text-indigo-600' : 'text-slate-500'
                }`}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500">Last 6 months</span>
        <span className="text-xs font-semibold text-indigo-600">
          {formatCurrency(months.reduce((s, m) => s + m.total, 0))} total
        </span>
      </div>
    </div>
  );
}
