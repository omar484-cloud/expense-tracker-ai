'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { parseMultiExpense, parseBatch, ParseResult } from '@/lib/parser';
import { Category, CATEGORY_META } from '@/types/expense';
import { useApp } from '@/context/AppContext';
import ParsePreview from './ParsePreview';

export default function NLInput() {
  const { addExpense, addExpenses } = useApp();
  const [text, setText] = useState('');
  const [results, setResults] = useState<ParseResult[]>([]);
  const [isBatch, setIsBatch] = useState(false);
  const [flash, setFlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse on input change
  useEffect(() => {
    const trimmed = text.trim();
    if (!trimmed) { setResults([]); setIsBatch(false); return; }

    const lines = trimmed.split('\n').filter(l => l.trim());
    const multiLine = lines.length > 1;

    if (multiLine) {
      const batch = parseBatch(trimmed);
      setResults(batch);
      setIsBatch(true);
    } else {
      const parsed = parseMultiExpense(trimmed);
      setResults(parsed);
      setIsBatch(false);
    }
  }, [text]);

  const submit = useCallback(() => {
    const valid = results.filter(r => r.amount !== null);
    if (!valid.length) return;

    if (valid.length === 1) {
      addExpense(valid[0]);
    } else {
      addExpenses(valid);
    }

    setText('');
    setResults([]);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    textareaRef.current?.focus();
  }, [results, addExpense, addExpenses]);

  const handleKey = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to submit (Shift+Enter = newline for batch mode)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }, [submit]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.split('\n').filter(l => l.trim()).length > 1) {
      // Let it paste naturally, batch mode will kick in via the effect
    }
  }, []);

  const changeCategory = useCallback((idx: number, cat: Category) => {
    setResults(prev => prev.map((r, i) => i === idx ? { ...r, category: cat } : r));
  }, []);

  // Derive border color from first result's category
  const borderColor = results.length > 0
    ? CATEGORY_META[results[0].category].color + '88'
    : 'var(--border2)';
  const glowColor = results.length > 0
    ? CATEGORY_META[results[0].category].color + '33'
    : 'transparent';

  const hasValid = results.some(r => r.amount !== null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }, [text]);

  return (
    <div
      className="border-t flex-shrink-0"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--surface)',
        transition: 'background 0.2s ease',
        ...(flash ? { background: 'var(--surface2)' } : {}),
      }}
    >
      {/* Parse preview */}
      {results.length > 0 && (
        <ParsePreview results={results} onChangeCategory={changeCategory} />
      )}

      {/* Input row */}
      <div className="flex items-end gap-3 px-4 py-3">
        {/* Batch mode indicator */}
        {isBatch && (
          <div
            className="flex-shrink-0 text-xs px-2 py-1 rounded-lg font-medium mb-1"
            style={{ background: '#f59e0b22', color: '#f59e0b', border: '1px solid #f59e0b44' }}
          >
            batch
          </div>
        )}

        {/* Textarea */}
        <div
          className="flex-1 rounded-xl transition-all"
          style={{
            border: `1px solid ${borderColor}`,
            boxShadow: `0 0 0 3px ${glowColor}`,
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKey}
            onPaste={handlePaste}
            placeholder={
              isBatch
                ? 'Paste more lines… Shift+Enter for newlines, Enter to add all'
                : 'What did you spend on? e.g. "coffee $4.50 this morning" or paste a bank statement'
            }
            rows={1}
            className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none resize-none leading-relaxed"
            style={{ minHeight: 40, maxHeight: 120 }}
            autoFocus
          />
        </div>

        {/* Submit button */}
        <button
          onClick={submit}
          disabled={!hasValid}
          className="flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: hasValid ? '#f59e0b' : 'var(--border)',
            color: hasValid ? '#000' : 'var(--muted2)',
            cursor: hasValid ? 'pointer' : 'not-allowed',
            transform: hasValid ? 'scale(1)' : 'scale(0.97)',
            transition: 'all 0.15s ease',
          }}
          title="Add expense (Enter)"
        >
          {results.length > 1 ? `Add ${results.filter(r => r.amount !== null).length}` : 'Add'}
        </button>
      </div>

      {/* Hint */}
      <div className="px-4 pb-2 flex items-center gap-4 text-xs" style={{ color: 'var(--muted2)' }}>
        <span><kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--border)', color: 'var(--muted)' }}>Enter</kbd> to add</span>
        <span><kbd className="px-1 py-0.5 rounded text-xs" style={{ background: 'var(--border)', color: 'var(--muted)' }}>Shift+Enter</kbd> for multiple lines</span>
        <span className="hidden md:inline">Click any card to edit</span>
      </div>
    </div>
  );
}
