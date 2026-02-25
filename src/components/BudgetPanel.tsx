'use client';

import React, { useMemo } from 'react';
import { CATEGORIES } from '@/types/expense';
import { useApp } from '@/context/AppContext';
import { getSpendingPersona, generateSampleData } from '@/lib/insights';
import { ParseResult } from '@/lib/parser';
import CategoryRing from './CategoryRing';

interface Props {
  year: number;
  month: number;
}

const MONTH_NAMES = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];

export default function BudgetPanel({ year, month }: Props) {
  const { expenses, getMonthExpenses, budgets, addExpenses, clearAll } = useApp();
  const monthExpenses = getMonthExpenses(year, month);

  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);
  const budgetPct = totalBudget > 0 ? Math.min(monthTotal / totalBudget, 1) : 0;

  const persona = useMemo(() => getSpendingPersona(monthExpenses), [monthExpenses]);

  function loadSample() {
    const sample = generateSampleData();
    const results: ParseResult[] = sample.map(s => ({
      amount: s.amount,
      description: s.description,
      category: s.category,
      date: new Date(s.date + 'T00:00:00'),
      confidence: 'high' as const,
      raw: '',
    }));
    addExpenses(results);
  }

  return (
    <aside
      className="flex flex-col border-r"
      style={{
        width: 260,
        flexShrink: 0,
        borderColor: 'var(--border)',
        background: 'var(--surface)',
        overflowY: 'auto',
      }}
    >
      {/* Month heading */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'var(--muted)' }}>
          {MONTH_NAMES[month - 1]} {year}
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-slate-100">
            ${monthTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            / ${totalBudget.toLocaleString()}
          </span>
        </div>
        {/* Overall budget bar */}
        <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border2)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${budgetPct * 100}%`,
              background: budgetPct >= 0.9 ? '#ef4444' : budgetPct >= 0.7 ? '#f59e0b' : '#34d399',
            }}
          />
        </div>
      </div>

      {/* Category rings */}
      <div className="px-4 py-2 flex-1">
        <div className="text-xs font-semibold tracking-widest uppercase mb-1 mt-2" style={{ color: 'var(--muted2)' }}>
          Budgets · click $ to edit
        </div>
        {CATEGORIES.map(cat => (
          <CategoryRing key={cat} category={cat} year={year} month={month} />
        ))}
      </div>

      {/* Persona */}
      {expenses.length > 0 && (
        <div
          className="mx-3 mb-3 rounded-xl p-3"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          <div className="text-base mb-1">{persona.emoji}</div>
          <div className="text-xs font-semibold text-slate-300">{persona.title}</div>
          <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {persona.description}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        {expenses.length === 0 && (
          <button
            onClick={loadSample}
            className="w-full py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#f59e0b',
            }}
          >
            ✨ Load sample data
          </button>
        )}
        {expenses.length > 0 && (
          <button
            onClick={() => { if (confirm('Clear all expenses?')) clearAll(); }}
            className="w-full py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
            }}
          >
            Clear all data
          </button>
        )}
      </div>
    </aside>
  );
}
