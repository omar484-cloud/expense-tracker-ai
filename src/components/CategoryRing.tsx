'use client';

import React, { useState } from 'react';
import { Category, CATEGORY_META } from '@/types/expense';
import { useApp } from '@/context/AppContext';

interface Props {
  category: Category;
  year: number;
  month: number;
}

const R = 38; // radius
const CIRCUMFERENCE = 2 * Math.PI * R; // ~238.76

export default function CategoryRing({ category, year, month }: Props) {
  const { budgets, getCategoryMonthTotal, updateBudget } = useApp();
  const meta = CATEGORY_META[category];
  const budget = budgets[category] ?? 0;
  const spent = getCategoryMonthTotal(category, year, month);
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const offset = CIRCUMFERENCE * (1 - pct);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const color =
    pct >= 0.9 ? '#ef4444' :
    pct >= 0.7 ? '#f59e0b' :
    meta.color;

  const fmt = (n: number) =>
    n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`;

  return (
    <div className="flex items-center gap-3 py-2 group">
      {/* Ring */}
      <div className="relative flex-shrink-0" style={{ width: 52, height: 52 }}>
        <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx="26" cy="26" r={R}
            fill="none"
            stroke="#1e1e2e"
            strokeWidth="5"
          />
          {/* Fill */}
          <circle
            cx="26" cy="26" r={R}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1), stroke 0.4s ease' }}
          />
        </svg>
        {/* Emoji */}
        <span
          className="absolute inset-0 flex items-center justify-center text-base"
          style={{ fontSize: 18 }}
        >
          {meta.emoji}
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200 truncate">{meta.label}</span>
          <span className="text-xs font-mono ml-1" style={{ color }}>
            {pct >= 1 ? 'OVER' : `${Math.round(pct * 100)}%`}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-slate-400">{fmt(spent)}</span>
          <span className="text-xs text-slate-600">/</span>
          {editing ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                const val = parseFloat(draft);
                if (!isNaN(val) && val > 0) updateBudget(category, val);
                setEditing(false);
              }}
            >
              <input
                autoFocus
                type="number"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onBlur={() => setEditing(false)}
                className="w-16 text-xs bg-transparent border-b border-amber-400 text-amber-400 outline-none font-mono"
                placeholder={String(budget)}
              />
            </form>
          ) : (
            <button
              onClick={() => { setDraft(String(budget)); setEditing(true); }}
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors font-mono"
              title="Click to edit budget"
            >
              {fmt(budget)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
