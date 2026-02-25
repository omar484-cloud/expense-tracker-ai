'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

interface Props {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Header({ year, month, onPrev, onNext }: Props) {
  const { expenses } = useApp();
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <header
      className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-xl">💸</span>
        <span className="text-base font-bold tracking-tight text-slate-100">Spill</span>
        <span className="text-xs ml-1 hidden sm:inline" style={{ color: 'var(--muted)' }}>
          just tell me what you spent
        </span>
      </div>

      {/* Month navigator */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--muted)', background: 'var(--surface2)' }}
        >
          ‹
        </button>
        <span className="text-sm font-semibold text-slate-300 min-w-[80px] text-center">
          {MONTHS[month - 1]} {year}
          {isCurrentMonth && (
            <span className="ml-1 text-xs" style={{ color: '#f59e0b' }}>●</span>
          )}
        </span>
        <button
          onClick={onNext}
          disabled={isCurrentMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{
            color: isCurrentMonth ? 'var(--border2)' : 'var(--muted)',
            background: 'var(--surface2)',
            cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
          }}
        >
          ›
        </button>
      </div>

      {/* Expense count */}
      <div className="hidden sm:flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
        <span className="font-semibold text-slate-400">{expenses.length}</span>
        <span>expenses</span>
      </div>
    </header>
  );
}
