'use client';

import React, { useState, useRef } from 'react';
import { Expense, Category, CATEGORY_META, CATEGORIES } from '@/types/expense';
import { useApp } from '@/context/AppContext';

interface Props {
  expense: Expense;
  isNew?: boolean;
}

export default function ExpenseCard({ expense, isNew }: Props) {
  const { updateExpense, deleteExpense } = useApp();
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [draft, setDraft] = useState({ ...expense });
  const meta = CATEGORY_META[expense.category];

  function startEdit() {
    setDraft({ ...expense });
    setEditing(true);
  }

  function save() {
    if (draft.amount > 0) {
      updateExpense(expense.id, {
        amount: draft.amount,
        description: draft.description,
        category: draft.category,
        date: draft.date,
      });
    }
    setEditing(false);
  }

  function cancel() {
    setEditing(false);
  }

  const fmtAmount = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });

  const fmtDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (editing) {
    return (
      <div
        className="rounded-xl p-3 animate-fade-in"
        style={{
          background: 'var(--surface2)',
          border: `1px solid ${meta.color}44`,
          boxShadow: `0 0 0 1px ${meta.color}22`,
        }}
      >
        <div className="flex flex-col gap-2">
          {/* Amount */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-20">Amount</span>
            <input
              type="number"
              step="0.01"
              value={draft.amount}
              onChange={e => setDraft(d => ({ ...d, amount: parseFloat(e.target.value) || 0 }))}
              className="flex-1 px-2 py-1 rounded-lg text-sm font-mono bg-[#0a0a0f] border text-slate-200 outline-none"
              style={{ borderColor: 'var(--border2)' }}
            />
          </div>
          {/* Description */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-20">Description</span>
            <input
              type="text"
              value={draft.description}
              onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
              className="flex-1 px-2 py-1 rounded-lg text-sm bg-[#0a0a0f] border text-slate-200 outline-none"
              style={{ borderColor: 'var(--border2)' }}
            />
          </div>
          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-20">Category</span>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => {
                const cm = CATEGORY_META[cat];
                const active = draft.category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setDraft(d => ({ ...d, category: cat as Category }))}
                    className="text-xs px-2 py-0.5 rounded-full transition-all"
                    style={{
                      background: active ? cm.color + '33' : 'transparent',
                      border: `1px solid ${active ? cm.color : 'var(--border2)'}`,
                      color: active ? cm.color : 'var(--muted)',
                    }}
                  >
                    {cm.emoji} {cm.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-20">Date</span>
            <input
              type="date"
              value={draft.date}
              onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
              className="flex-1 px-2 py-1 rounded-lg text-sm bg-[#0a0a0f] border text-slate-200 outline-none"
              style={{ borderColor: 'var(--border2)', colorScheme: 'dark' }}
            />
          </div>
          {/* Actions */}
          <div className="flex gap-2 justify-end mt-1">
            <button
              onClick={cancel}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: 'var(--border)', color: 'var(--muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
              style={{ background: '#f59e0b22', border: '1px solid #f59e0b55', color: '#f59e0b' }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl flex items-center gap-3 px-3 py-2.5 transition-all cursor-pointer group ${isNew ? 'animate-slide-in' : ''}`}
      style={{
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? meta.color + '33' : 'var(--border)'}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={startEdit}
    >
      {/* Category color strip */}
      <div
        className="flex-shrink-0 w-1 self-stretch rounded-full"
        style={{ background: meta.color, minHeight: 32 }}
      />

      {/* Emoji */}
      <span className="text-xl flex-shrink-0" role="img" aria-label={meta.label}>
        {meta.emoji}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-200 truncate capitalize">
            {expense.description}
          </span>
          <span
            className="text-sm font-bold tabular-nums ml-2 flex-shrink-0"
            style={{ color: meta.color }}
          >
            {fmtAmount(expense.amount)}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs px-1.5 py-0.5 rounded-md"
            style={{ background: meta.bg, color: meta.color, fontSize: 11 }}
          >
            {meta.label}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted2)' }}>
            {fmtDate(expense.date)}
          </span>
        </div>
      </div>

      {/* Delete button (visible on hover) */}
      <button
        className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
        onClick={e => {
          e.stopPropagation();
          deleteExpense(expense.id);
        }}
        title="Delete"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
        </svg>
      </button>
    </div>
  );
}
