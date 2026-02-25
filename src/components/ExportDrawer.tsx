'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  X,
  Download,
  FileText,
  FileJson,
  Printer,
  Calendar,
  Tag,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import {
  Category,
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_BADGE_CLASSES,
  CATEGORY_ICONS,
} from '@/types/expense';
import { Expense } from '@/types/expense';
import { formatDate, formatCurrency, getMonthStart, getMonthEnd, getYearStart, getTodayString } from '@/utils/formatters';
import { exportCSV, exportJSON, exportPDF, ExportMeta } from '@/utils/exporters';

// ─── Types ─────────────────────────────────────────────────────────────────────

type ExportFormat = 'csv' | 'json' | 'pdf';
type DatePreset = 'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom';

// ─── Constants ─────────────────────────────────────────────────────────────────

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  ext: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}[] = [
  {
    id: 'csv',
    label: 'CSV',
    ext: '.csv',
    icon: FileText,
    description: 'Spreadsheets, Excel, Google Sheets',
  },
  {
    id: 'json',
    label: 'JSON',
    ext: '.json',
    icon: FileJson,
    description: 'APIs, developers, data tools',
  },
  {
    id: 'pdf',
    label: 'PDF',
    ext: '.pdf',
    icon: Printer,
    description: 'Print-ready financial report',
    badge: 'Report',
  },
];

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'last3Months', label: 'Last 3 Months' },
  { id: 'thisYear', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

// ─── Helper: resolve date range from preset ────────────────────────────────────

function resolveRange(
  preset: DatePreset,
  customFrom: string,
  customTo: string,
): { from: string; to: string } {
  const today = getTodayString();
  switch (preset) {
    case 'thisMonth':    return { from: getMonthStart(0),  to: getMonthEnd(0) };
    case 'lastMonth':   return { from: getMonthStart(-1), to: getMonthEnd(-1) };
    case 'last3Months': return { from: getMonthStart(-2), to: today };
    case 'thisYear':    return { from: getYearStart(),    to: today };
    case 'custom':      return { from: customFrom, to: customTo };
    default:            return { from: '', to: '' };
  }
}

function dateRangeLabel(preset: DatePreset, from: string, to: string): string {
  if (preset === 'all' || (!from && !to)) return 'All Time';
  const fmt = (d: string) => (d ? formatDate(d) : '?');
  if (from && to) return `${fmt(from)} – ${fmt(to)}`;
  if (from) return `From ${fmt(from)}`;
  return `To ${fmt(to)}`;
}

// ─── Helper: filter expenses ───────────────────────────────────────────────────

function filterExpenses(
  expenses: Expense[],
  preset: DatePreset,
  customFrom: string,
  customTo: string,
  cats: Set<Category>,
): Expense[] {
  const { from, to } = resolveRange(preset, customFrom, customTo);
  return expenses.filter(e => {
    if (from && e.date < from) return false;
    if (to && e.date > to) return false;
    if (!cats.has(e.category)) return false;
    return true;
  });
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function ExportDrawer({ isOpen, onClose }: Props) {
  const { expenses, showToast } = useExpenses();

  // Format
  const [format, setFormat] = useState<ExportFormat>('csv');

  // Date range
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Categories
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(new Set(CATEGORIES));

  // Filename
  const [filename, setFilename] = useState('expenses');

  // UI state
  const [showPreview, setShowPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  // Default filename when format changes
  useEffect(() => {
    const today = getTodayString();
    setFilename(`expenses-${today}`);
  }, [format]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Derived: filtered expenses
  const filtered = useMemo(
    () => filterExpenses(expenses, datePreset, customFrom, customTo, selectedCats),
    [expenses, datePreset, customFrom, customTo, selectedCats],
  );

  const total = useMemo(
    () => filtered.reduce((s, e) => s + e.amount, 0),
    [filtered],
  );

  // Category summary for the preview header
  const catSummary = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of filtered) {
      map[e.category] = (map[e.category] || 0) + e.amount;
    }
    return map;
  }, [filtered]);

  // Toggle a single category
  const toggleCat = useCallback((cat: Category) => {
    setSelectedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const allSelected = selectedCats.size === CATEGORIES.length;
  const toggleAll = useCallback(() => {
    setSelectedCats(allSelected ? new Set([CATEGORIES[0]]) : new Set(CATEGORIES));
  }, [allSelected]);

  // Build export metadata
  const buildMeta = useCallback((): ExportMeta => {
    const { from, to } = resolveRange(datePreset, customFrom, customTo);
    return {
      exportedAt: new Date().toISOString(),
      dateRange: dateRangeLabel(datePreset, from, to),
      totalRecords: filtered.length,
      totalAmount: total,
    };
  }, [datePreset, customFrom, customTo, filtered.length, total]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (filtered.length === 0) {
      showToast('No records match the current filters', 'error');
      return;
    }
    setIsExporting(true);

    // Brief loading delay for UX feedback
    await new Promise(r => setTimeout(r, 700));

    try {
      const ext = format === 'csv' ? '.csv' : format === 'json' ? '.json' : '.pdf';
      const fullName = (filename.trim() || 'expenses') + ext;
      const meta = buildMeta();

      if (format === 'csv') exportCSV(filtered, fullName, meta);
      else if (format === 'json') exportJSON(filtered, fullName, meta);
      else exportPDF(filtered, fullName, meta);

      setExportDone(true);
      showToast(`Exported ${filtered.length} records as ${format.toUpperCase()}`);

      setTimeout(() => {
        setExportDone(false);
        onClose();
      }, 1600);
    } finally {
      setIsExporting(false);
    }
  }, [filtered, format, filename, buildMeta, showToast, onClose]);

  const formatExt = format === 'csv' ? '.csv' : format === 'json' ? '.json' : '.pdf';
  const { from: resolvedFrom, to: resolvedTo } = resolveRange(datePreset, customFrom, customTo);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Export Data"
        className={`fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 'min(480px, 100vw)', borderLeft: '1px solid #e2e8f0' }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50">
              <Download size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Export Data</h2>
              <p className="text-xs text-slate-500 mt-0.5">Configure and download your expenses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close export panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* ── Format selector ── */}
          <section>
            <SectionLabel icon={FileText} label="Export Format" />
            <div className="grid grid-cols-3 gap-3 mt-3">
              {FORMAT_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = format === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setFormat(opt.id)}
                    className={`relative flex flex-col items-center gap-2 rounded-xl p-4 border-2 transition-all text-center ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {opt.badge && (
                      <span className="absolute -top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {opt.badge}
                      </span>
                    )}
                    <Icon size={22} className={active ? 'text-indigo-600' : 'text-slate-400'} />
                    <span className={`text-sm font-semibold ${active ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-slate-400 leading-tight">{opt.description}</span>
                    {active && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Date range ── */}
          <section>
            <SectionLabel icon={Calendar} label="Date Range" />
            <div className="flex flex-wrap gap-2 mt-3">
              {DATE_PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    datePreset === p.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {datePreset === 'custom' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    max={customTo || getTodayString()}
                    onChange={e => setCustomFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1">To</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    max={getTodayString()}
                    onChange={e => setCustomTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {(resolvedFrom || resolvedTo) && (
              <p className="mt-2 text-xs text-slate-400">
                Showing: <span className="font-medium text-slate-600">{dateRangeLabel(datePreset, resolvedFrom, resolvedTo)}</span>
              </p>
            )}
          </section>

          {/* ── Categories ── */}
          <section>
            <div className="flex items-center justify-between">
              <SectionLabel icon={Tag} label="Categories" />
              <button
                onClick={toggleAll}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {CATEGORIES.map(cat => {
                const active = selectedCats.has(cat);
                const color = CATEGORY_COLORS[cat];
                const catTotal = catSummary[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCat(cat)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left ${
                      active
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-100 bg-white opacity-50 hover:opacity-75'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all`}
                      style={{
                        borderColor: active ? color : '#cbd5e1',
                        background: active ? color : 'white',
                      }}
                    >
                      {active && <Check size={10} className="text-white" strokeWidth={3} />}
                    </div>

                    {/* Icon + name */}
                    <span className="text-base flex-shrink-0">{CATEGORY_ICONS[cat]}</span>
                    <span className="flex-1 text-sm font-medium text-slate-700">{cat}</span>

                    {/* Spend in current filter */}
                    {catTotal > 0 && (
                      <span className="text-xs font-mono text-slate-400">
                        {formatCurrency(catTotal)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Filename ── */}
          <section>
            <SectionLabel icon={FileText} label="Filename" />
            <div className="mt-3 flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent">
              <input
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="expenses"
                className="flex-1 px-3 py-2.5 text-sm text-slate-700 bg-white outline-none"
              />
              <div className="px-3 py-2.5 bg-slate-50 border-l border-slate-200 text-xs font-mono text-slate-500 flex-shrink-0">
                {formatExt}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              Will save as: <span className="font-medium text-slate-600">{(filename.trim() || 'expenses') + formatExt}</span>
            </p>
          </section>

          {/* ── Preview ── */}
          <section>
            <div className="flex items-center justify-between">
              <SectionLabel
                icon={showPreview ? Eye : EyeOff}
                label={`Preview`}
                badge={filtered.length > 0 ? `${filtered.length} records` : undefined}
              />
              <button
                onClick={() => setShowPreview(v => !v)}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform ${showPreview ? 'rotate-90' : ''}`}
                />
                {showPreview ? 'Hide' : 'Show preview'}
              </button>
            </div>

            {showPreview && (
              <div className="mt-3 rounded-xl border border-slate-200 overflow-hidden">
                {filtered.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    No records match the current filters
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0">
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Date</th>
                          <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Category</th>
                          <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Description</th>
                          <th className="text-right px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.slice(0, 50).map((e, i) => (
                          <tr
                            key={e.id}
                            className={`border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                          >
                            <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{formatDate(e.date)}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium ring-1 ring-inset ${CATEGORY_BADGE_CLASSES[e.category]}`}>
                                {CATEGORY_ICONS[e.category]} {e.category}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-600 max-w-[140px] truncate">{e.description || '—'}</td>
                            <td className="px-3 py-2 text-right font-medium text-slate-700 tabular-nums whitespace-nowrap">{formatCurrency(e.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filtered.length > 50 && (
                      <div className="px-3 py-2 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                        Showing first 50 of {filtered.length} records
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-6 py-4">
          {/* Summary row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xs text-slate-400">Records</div>
                <div className="text-lg font-bold text-slate-800 leading-tight">{filtered.length}</div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <div className="text-xs text-slate-400">Total amount</div>
                <div className="text-lg font-bold text-slate-800 leading-tight tabular-nums">{formatCurrency(total)}</div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <div className="text-xs text-slate-400">Format</div>
                <div className="text-sm font-bold text-indigo-600 uppercase leading-tight">{format}</div>
              </div>
            </div>
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            disabled={isExporting || exportDone || filtered.length === 0}
            className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all ${
              exportDone
                ? 'bg-emerald-500 text-white'
                : filtered.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 active:scale-[0.98]'
            }`}
          >
            {exportDone ? (
              <>
                <Check size={16} strokeWidth={2.5} />
                Exported successfully!
              </>
            ) : isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Exporting{format === 'pdf' ? ' report' : ''}…
              </>
            ) : (
              <>
                <Download size={16} />
                Export {filtered.length > 0 ? `${filtered.length} records` : ''} as {format.toUpperCase()}
              </>
            )}
          </button>

          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-400 mt-2">
              Adjust filters above to include records
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Sub-component: section label ─────────────────────────────────────────────

function SectionLabel({
  icon: Icon,
  label,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  badge?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-slate-400" />
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
          {badge}
        </span>
      )}
    </div>
  );
}
