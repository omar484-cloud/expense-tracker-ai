'use client';

import React from 'react';
import { ParseResult } from '@/lib/parser';
import { Category, CATEGORY_META, CATEGORIES } from '@/types/expense';

interface Props {
  results: ParseResult[];
  onChangeCategory: (idx: number, cat: Category) => void;
}

export default function ParsePreview({ results, onChangeCategory }: Props) {
  if (!results.length) return null;

  const fmtDate = (d: Date) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
    if (d.getTime() === today.getTime()) return 'today';
    if (d.getTime() === yesterday.getTime()) return 'yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (results.length === 1) {
    const r = results[0];
    const meta = CATEGORY_META[r.category];
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 text-sm flex-wrap animate-fade-in"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        {r.amount !== null ? (
          <span className="font-bold tabular-nums text-slate-100">
            ${r.amount.toFixed(2)}
          </span>
        ) : (
          <span style={{ color: 'var(--muted)' }}>amount?</span>
        )}
        <span className="text-slate-500">·</span>
        {/* Category picker */}
        <div className="relative group flex items-center">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-all"
            style={{
              background: meta.bg,
              border: `1px solid ${meta.color}66`,
              color: meta.color,
            }}
          >
            {meta.emoji} {meta.label}
            <svg className="ml-0.5" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </span>
          {/* Dropdown */}
          <div
            className="absolute bottom-8 left-0 hidden group-hover:flex flex-col gap-0.5 rounded-xl p-1.5 z-50 min-w-max"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            {CATEGORIES.map(cat => {
              const cm = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => onChangeCategory(0, cat)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left"
                  style={{
                    background: r.category === cat ? cm.bg : 'transparent',
                    color: r.category === cat ? cm.color : 'var(--text)',
                  }}
                >
                  <span>{cm.emoji}</span>
                  <span>{cm.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <span className="text-slate-500">·</span>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{fmtDate(r.date)}</span>
        {r.description && (
          <>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 truncate max-w-xs capitalize">{r.description}</span>
          </>
        )}
        {/* Confidence dot */}
        <span
          className="ml-auto text-xs flex items-center gap-1"
          style={{ color: r.confidence === 'high' ? '#34d399' : r.confidence === 'medium' ? '#f59e0b' : '#94a3b8' }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: 'currentColor' }}
          />
          {r.confidence}
        </span>
      </div>
    );
  }

  // Multiple expenses
  return (
    <div
      className="px-4 py-2 animate-fade-in"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="text-xs mb-2 font-medium" style={{ color: '#f59e0b' }}>
        {results.length} expenses detected — press Enter to add all
      </div>
      <div className="flex flex-col gap-1">
        {results.map((r, i) => {
          const meta = CATEGORY_META[r.category];
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="font-bold tabular-nums text-slate-200">
                {r.amount !== null ? `$${r.amount.toFixed(2)}` : '?'}
              </span>
              <span
                className="px-1.5 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color, fontSize: 11 }}
              >
                {meta.emoji} {meta.label}
              </span>
              <span className="truncate text-slate-400 capitalize">{r.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
