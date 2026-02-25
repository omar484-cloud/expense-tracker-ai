'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { groupByDate } from '@/lib/insights';
import ExpenseCard from './ExpenseCard';

export default function ExpenseFeed() {
  const { expenses, loaded } = useApp();
  const [newestId, setNewestId] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (expenses.length > prevCountRef.current && expenses.length > 0) {
      setNewestId(expenses[0].id);
      const t = setTimeout(() => setNewestId(null), 600);
      return () => clearTimeout(t);
    }
    prevCountRef.current = expenses.length;
  }, [expenses]);

  const groups = groupByDate(expenses);

  if (!loaded) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--muted2)' }}>
        <div className="text-sm">Loading…</div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">💸</div>
        <div className="text-xl font-semibold text-slate-300 mb-2">Nothing here yet</div>
        <div className="text-sm leading-relaxed max-w-xs" style={{ color: 'var(--muted)' }}>
          Just start typing below. Try{' '}
          <span className="text-amber-400 font-mono">"coffee $4.50 this morning"</span> or{' '}
          <span className="text-amber-400 font-mono">"uber to work $18 yesterday"</span>
        </div>
        <div className="mt-4 text-xs" style={{ color: 'var(--muted2)' }}>
          Or paste a bank statement for instant bulk import ↓
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="max-w-2xl mx-auto">
        {groups.map(group => (
          <div key={group.date} className="mb-6">
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ color: 'var(--muted)' }}
              >
                {group.label}
              </span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-mono" style={{ color: 'var(--muted2)' }}>
                ${group.items.reduce((s, e) => s + e.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2">
              {group.items.map(expense => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  isNew={expense.id === newestId}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-xs py-6" style={{ color: 'var(--muted2)' }}>
          {expenses.length} expense{expenses.length !== 1 ? 's' : ''} total
        </div>
      </div>
    </div>
  );
}
