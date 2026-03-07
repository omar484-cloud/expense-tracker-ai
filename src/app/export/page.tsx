'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Mail, Sheet, CloudIcon, Cloud, BookOpen, MessageSquare,
  Zap, Clock, History, Link2, Plus, Check, Loader2, Trash2,
  Copy, RefreshCw, ChevronRight, AlertCircle, X, Download,
  FileText, FileJson, Printer, ToggleLeft, ToggleRight,
  ExternalLink, Bell, Sparkles,
} from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import {
  ServiceId, ExportFormat, Connection, ExportRecord, Schedule, SharedLink,
  getConnections, saveConnections,
  getHistory, addHistoryEntry, clearHistory,
  getSchedules, saveSchedules, addSchedule,
  getSharedLinks, createSharedLink, revokeSharedLink,
  getNextRun, estimateFileSize,
} from '@/lib/cloudExport';
import { CATEGORIES, CATEGORY_ICONS } from '@/types/expense';
import { downloadCSV, downloadJSON, openPDFReport } from '@/utils/exporters';
import { formatCurrency, formatDate, getTodayString, getMonthStart, getMonthEnd, getYearStart } from '@/utils/formatters';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'destinations' | 'templates' | 'schedule' | 'history' | 'share';

// ─── Service metadata ──────────────────────────────────────────────────────────

const SERVICES: Record<ServiceId, {
  name: string;
  desc: string;
  icon: string;
  color: string;
  bg: string;
  configLabel: string;
  configPlaceholder: string;
}> = {
  email:         { name: 'Email',         desc: 'Receive reports in your inbox',        icon: '✉️',  color: '#6366f1', bg: '#eef2ff', configLabel: 'Email address',   configPlaceholder: 'you@example.com' },
  'google-sheets':{ name: 'Google Sheets', desc: 'Sync to a spreadsheet automatically',  icon: '📊',  color: '#16a34a', bg: '#f0fdf4', configLabel: 'Sheet name',      configPlaceholder: 'My Expenses 2026' },
  dropbox:       { name: 'Dropbox',       desc: 'Auto-backup to your Dropbox folder',   icon: '📦',  color: '#0061fe', bg: '#eff6ff', configLabel: 'Folder path',     configPlaceholder: '/Apps/ExpenseTracker' },
  onedrive:      { name: 'OneDrive',      desc: 'Save to Microsoft cloud storage',      icon: '☁️',  color: '#0078d4', bg: '#eff6ff', configLabel: 'Folder path',     configPlaceholder: '/ExpenseTracker' },
  notion:        { name: 'Notion',        desc: 'Export to a Notion database',          icon: '📝',  color: '#1e293b', bg: '#f8fafc', configLabel: 'Page/DB name',    configPlaceholder: 'Expense Database' },
  slack:         { name: 'Slack',         desc: 'Post summaries to a channel',          icon: '💬',  color: '#4a154b', bg: '#fdf4ff', configLabel: 'Channel',         configPlaceholder: '#finance-reports' },
};

// ─── Template metadata ─────────────────────────────────────────────────────────

interface Template {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  badge: string;
  badgeColor: string;
  format: ExportFormat;
  getDateRange: () => { from: string; to: string };
  highlight: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'tax',
    name: 'Tax Report',
    desc: 'Full-year breakdown, categorised for tax filing. Includes all categories with per-category totals.',
    emoji: '🧾',
    badge: 'Annual',
    badgeColor: '#ef4444',
    format: 'PDF',
    getDateRange: () => ({ from: getYearStart(), to: getTodayString() }),
    highlight: 'Best for accountants',
  },
  {
    id: 'monthly',
    name: 'Monthly Review',
    desc: "This month's spending at a glance. Perfect for personal budget reviews at month-end.",
    emoji: '📅',
    badge: 'This Month',
    badgeColor: '#3b82f6',
    format: 'PDF',
    getDateRange: () => ({ from: getMonthStart(0), to: getMonthEnd(0) }),
    highlight: 'Great for budgeting',
  },
  {
    id: 'category',
    name: 'Category Analysis',
    desc: 'Three months of spending grouped by category. Ideal for identifying spending patterns.',
    emoji: '📊',
    badge: 'Last 3 Months',
    badgeColor: '#8b5cf6',
    format: 'JSON',
    getDateRange: () => ({ from: getMonthStart(-2), to: getTodayString() }),
    highlight: 'Data-analyst friendly',
  },
  {
    id: 'snapshot',
    name: 'Spending Snapshot',
    desc: 'Quick CSV export of all expenses. Ready for spreadsheet analysis in Excel or Google Sheets.',
    emoji: '⚡',
    badge: 'All Time',
    badgeColor: '#f59e0b',
    format: 'CSV',
    getDateRange: () => ({ from: '', to: '' }),
    highlight: 'Ready for spreadsheets',
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d >= 1) return `${d}d ago`;
  if (h >= 1) return `${h}h ago`;
  if (m >= 1) return `${m}m ago`;
  return 'just now';
}

function formatBadge(format: ExportFormat) {
  const map: Record<ExportFormat, { bg: string; text: string }> = {
    CSV:  { bg: 'bg-emerald-100 text-emerald-700', text: 'CSV'  },
    JSON: { bg: 'bg-blue-100 text-blue-700',       text: 'JSON' },
    PDF:  { bg: 'bg-rose-100 text-rose-700',       text: 'PDF'  },
  };
  return map[format];
}

function destLabel(dest: string): string {
  if (dest === 'download') return 'Download';
  return SERVICES[dest as ServiceId]?.name ?? dest;
}

// Deterministic fake QR pattern based on a string hash
function useQRGrid(value: string, size = 21) {
  return useMemo(() => {
    let h = 5381;
    for (let i = 0; i < value.length; i++) h = ((h << 5) + h + value.charCodeAt(i)) | 0;
    return Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => {
        // Finder patterns (top-left, top-right, bottom-left)
        const tlx = x < 7, tly = y < 7;
        const trx = x >= size - 7, try_ = y < 7;
        const blx = x < 7, bly = y >= size - 7;
        if (tlx && tly) { const fx = x, fy = y; if (fx === 0 || fx === 6 || fy === 0 || fy === 6) return true; if (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4) return true; return false; }
        if (trx && try_) { const fx = x - (size - 7), fy = y; if (fx === 0 || fx === 6 || fy === 0 || fy === 6) return true; if (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4) return true; return false; }
        if (blx && bly) { const fx = x, fy = y - (size - 7); if (fx === 0 || fx === 6 || fy === 0 || fy === 6) return true; if (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4) return true; return false; }
        return (((h ^ (x * 1031) ^ (y * 2053)) >>> 0) % 5) !== 0;
      })
    );
  }, [value, size]);
}

function QRCode({ value }: { value: string }) {
  const grid = useQRGrid(value);
  return (
    <div className="rounded-lg border-4 border-white shadow-sm overflow-hidden bg-white" style={{ width: 120, height: 120 }}>
      <svg viewBox="0 0 21 21" width={112} height={112}>
        {grid.map((row, y) => row.map((on, x) => on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#1e293b" /> : null))}
      </svg>
    </div>
  );
}

// ─── Tab nav ───────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'destinations', label: 'Destinations', icon: Zap },
  { id: 'templates',    label: 'Templates',    icon: FileText },
  { id: 'schedule',     label: 'Schedule',     icon: Clock },
  { id: 'history',      label: 'History',      icon: History },
  { id: 'share',        label: 'Share',        icon: Link2 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════════

export default function ExportHubPage() {
  const { expenses } = useExpenses();
  const [activeTab, setActiveTab] = useState<Tab>('destinations');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);

  useEffect(() => {
    setConnections(getConnections());
    setHistory(getHistory());
    setSchedules(getSchedules());
    setSharedLinks(getSharedLinks());
  }, []);

  // Reload history whenever a tab is activated
  useEffect(() => {
    setHistory(getHistory());
    setSharedLinks(getSharedLinks());
  }, [activeTab]);

  const recordExport = useCallback((entry: Omit<ExportRecord, 'id' | 'timestamp'>) => {
    addHistoryEntry(entry);
    setHistory(getHistory());
  }, []);

  const connectedCount = connections.filter(c => c.connected).length;

  return (
    <div className="space-y-0">
      {/* ── Hero header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-200">
              <Zap size={18} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Export Hub</h1>
          </div>
          <p className="text-sm text-slate-500">
            {connectedCount > 0
              ? `${connectedCount} service${connectedCount > 1 ? 's' : ''} connected · ${expenses.length} expenses ready to export`
              : `${expenses.length} expenses · connect services to automate exports`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick-stats pills */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-medium text-indigo-700">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {connectedCount} connected
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
            <History size={11} />
            {history.length} exports
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                active
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={14} className={active ? 'text-indigo-600' : ''} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'destinations' && (
        <DestinationsTab
          connections={connections}
          onConnectionsChange={c => { setConnections(c); saveConnections(c); }}
        />
      )}
      {activeTab === 'templates' && (
        <TemplatesTab expenses={expenses} connections={connections} onExport={recordExport} />
      )}
      {activeTab === 'schedule' && (
        <ScheduleTab
          schedules={schedules}
          connections={connections}
          expenses={expenses}
          onSchedulesChange={s => { setSchedules(s); saveSchedules(s); }}
        />
      )}
      {activeTab === 'history' && (
        <HistoryTab
          history={history}
          onClear={() => { clearHistory(); setHistory([]); }}
        />
      )}
      {activeTab === 'share' && (
        <ShareTab
          sharedLinks={sharedLinks}
          expenses={expenses}
          onRefresh={() => setSharedLinks(getSharedLinks())}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Destinations tab
// ═══════════════════════════════════════════════════════════════════════════════

function DestinationsTab({ connections, onConnectionsChange }: {
  connections: Connection[];
  onConnectionsChange: (c: Connection[]) => void;
}) {
  const [connecting, setConnecting] = useState<ServiceId | null>(null);
  const [configuring, setConfiguring] = useState<ServiceId | null>(null);
  const [draftLabel, setDraftLabel] = useState('');
  const [syncing, setSyncing] = useState<ServiceId | null>(null);

  function getConn(id: ServiceId) {
    return connections.find(c => c.service === id) ?? { service: id, connected: false };
  }

  function updateConn(updated: Connection) {
    const next = connections.some(c => c.service === updated.service)
      ? connections.map(c => c.service === updated.service ? updated : c)
      : [...connections, updated];
    onConnectionsChange(next);
  }

  async function handleConnect(id: ServiceId) {
    const meta = SERVICES[id];
    if (!draftLabel.trim()) { setConfiguring(id); return; }
    setConfiguring(null);
    setConnecting(id);
    await sleep(1800);
    updateConn({ service: id, connected: true, connectedAt: new Date().toISOString(), label: draftLabel.trim() });
    setConnecting(null);
    setDraftLabel('');
  }

  async function handleSync(id: ServiceId) {
    setSyncing(id);
    await sleep(1400);
    updateConn({ ...getConn(id), lastSynced: new Date().toISOString() });
    setSyncing(null);
  }

  function handleDisconnect(id: ServiceId) {
    updateConn({ service: id, connected: false });
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Connect services to automatically send your expense reports. Click a card to set up the integration.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(SERVICES) as ServiceId[]).map(id => {
          const meta = SERVICES[id];
          const conn = getConn(id);
          const isConnecting = connecting === id;
          const isSyncing = syncing === id;
          const isConfiguring = configuring === id;

          return (
            <div
              key={id}
              className={`rounded-2xl border p-5 transition-all ${
                conn.connected
                  ? 'border-slate-200 bg-white shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{meta.name}</span>
                      {conn.connected && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Connected
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{meta.desc}</p>
                  </div>
                </div>
              </div>

              {conn.connected && (
                <div className="mb-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{conn.label}</span>
                    {conn.lastSynced && <span className="ml-2 text-slate-400">· Last sync {relativeTime(conn.lastSynced)}</span>}
                    {!conn.lastSynced && <span className="ml-2 text-slate-400">· Never synced</span>}
                  </div>
                </div>
              )}

              {/* Config form */}
              {isConfiguring && !conn.connected && (
                <div className="mb-3">
                  <label className="text-xs font-medium text-slate-600 block mb-1">{meta.configLabel}</label>
                  <input
                    autoFocus
                    value={draftLabel}
                    onChange={e => setDraftLabel(e.target.value)}
                    placeholder={meta.configPlaceholder}
                    onKeyDown={e => e.key === 'Enter' && handleConnect(id)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!conn.connected ? (
                  isConnecting ? (
                    <button disabled className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium">
                      <Loader2 size={13} className="animate-spin" />
                      Connecting…
                    </button>
                  ) : isConfiguring ? (
                    <>
                      <button onClick={() => handleConnect(id)} disabled={!draftLabel.trim()} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-semibold transition-colors">
                        Connect
                      </button>
                      <button onClick={() => { setConfiguring(null); setDraftLabel(''); }} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs hover:bg-slate-50">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => { setConfiguring(id); setDraftLabel(''); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs font-medium transition-all group">
                      <Plus size={13} className="group-hover:text-indigo-600" />
                      Connect
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => handleSync(id)}
                      disabled={isSyncing}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-medium transition-colors"
                    >
                      {isSyncing
                        ? <><Loader2 size={12} className="animate-spin" /> Syncing…</>
                        : <><RefreshCw size={12} /> Sync Now</>}
                    </button>
                    <button
                      onClick={() => handleDisconnect(id)}
                      className="px-3 py-2 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-400 text-xs transition-colors"
                      title="Disconnect"
                    >
                      <X size={13} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Templates tab
// ═══════════════════════════════════════════════════════════════════════════════

function TemplatesTab({ expenses, connections, onExport }: {
  expenses: ReturnType<typeof useExpenses>['expenses'];
  connections: Connection[];
  onExport: (e: Omit<ExportRecord, 'id' | 'timestamp'>) => void;
}) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleExport(tpl: Template) {
    setExporting(tpl.id);
    await sleep(800);

    const { from, to } = tpl.getDateRange();
    const filtered = expenses.filter(e => {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    });
    const total = filtered.reduce((s, e) => s + e.amount, 0);
    const today = getTodayString();
    const filename = `${tpl.name.replace(/\s+/g, '-').toLowerCase()}-${today}`;

    if (tpl.format === 'CSV') downloadCSV(filtered, filename + '.csv', tpl.name);
    else if (tpl.format === 'JSON') downloadJSON(filtered, filename + '.json', tpl.name);
    else openPDFReport(filtered, tpl.name, `${from ? formatDate(from) : 'All time'} · ${filtered.length} records`);

    onExport({
      label: tpl.name,
      format: tpl.format,
      destination: 'download',
      recordCount: filtered.length,
      totalAmount: total,
      status: 'success',
      fileSize: estimateFileSize(filtered.length, tpl.format),
    });

    setExporting(null);
    setDone(tpl.id);
    setTimeout(() => setDone(null), 2000);
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Pre-built export configurations for common use cases. One click to download.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TEMPLATES.map(tpl => {
          const { from, to } = tpl.getDateRange();
          const count = expenses.filter(e => {
            if (from && e.date < from) return false;
            if (to && e.date > to) return false;
            return true;
          }).length;
          const fmtBadge = formatBadge(tpl.format);
          const isExporting = exporting === tpl.id;
          const isDone = done === tpl.id;

          return (
            <div key={tpl.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 hover:border-indigo-200 transition-colors group">
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{tpl.emoji}</span>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{tpl.name}</div>
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: tpl.badgeColor + '18', color: tpl.badgeColor }}
                    >
                      {tpl.badge}
                    </span>
                  </div>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${fmtBadge.bg}`}>
                  {fmtBadge.text}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>

              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-base font-bold text-slate-800">{count}</div>
                  <div className="text-[10px] text-slate-400">records</div>
                </div>
                <div className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                  <div className="text-[10px] text-slate-400">{estimateFileSize(count, tpl.format)}</div>
                  <div className="text-[10px] text-slate-400">est. size</div>
                </div>
              </div>

              {/* Highlight tag */}
              <div className="flex items-center gap-1.5 text-[11px] text-indigo-600">
                <Sparkles size={11} />
                {tpl.highlight}
              </div>

              {/* Export button */}
              <button
                onClick={() => handleExport(tpl)}
                disabled={isExporting || count === 0}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : count === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-100 active:scale-[0.98]'
                }`}
              >
                {isDone
                  ? <><Check size={15} /> Exported!</>
                  : isExporting
                  ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
                  : <><Download size={15} /> Export {tpl.format}</>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Schedule tab
// ═══════════════════════════════════════════════════════════════════════════════

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ScheduleTab({ schedules, connections, expenses, onSchedulesChange }: {
  schedules: Schedule[];
  connections: Connection[];
  expenses: ReturnType<typeof useExpenses>['expenses'];
  onSchedulesChange: (s: Schedule[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Schedule>>({ frequency: 'weekly', hour: 8, dayOfWeek: 1, format: 'CSV', destination: 'download', enabled: true, name: '' });

  const emailConn = connections.find(c => c.service === 'email' && c.connected);

  function handleAdd() {
    if (!form.name?.trim()) return;
    const s = addSchedule(form as Omit<Schedule, 'id' | 'createdAt'>);
    onSchedulesChange([...schedules, s]);
    setShowForm(false);
    setForm({ frequency: 'weekly', hour: 8, dayOfWeek: 1, format: 'CSV', destination: 'download', enabled: true, name: '' });
  }

  function toggleEnabled(id: string) {
    const updated = schedules.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    onSchedulesChange(updated);
    import('@/lib/cloudExport').then(m => m.saveSchedules(updated));
  }

  function deleteSchedule(id: string) {
    const updated = schedules.filter(s => s.id !== id);
    onSchedulesChange(updated);
    import('@/lib/cloudExport').then(m => m.saveSchedules(updated));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">Automate your exports. Schedules are simulated — in a live app, these would run server-side.</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
        >
          <Plus size={13} /> New Schedule
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/30 p-5 mb-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2"><Bell size={15} className="text-indigo-500" /> Configure Recurring Export</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Schedule name</label>
              <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Weekly backup" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Format</label>
              <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value as ExportFormat }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option>CSV</option><option>JSON</option><option>PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map(f => (
                  <button key={f} onClick={() => setForm(fm => ({ ...fm, frequency: f }))} className={`flex-1 py-2 rounded-lg text-xs font-medium border capitalize transition-all ${form.frequency === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Time</label>
              <select value={form.hour} onChange={e => setForm(f => ({ ...f, hour: Number(e.target.value) }))} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>)}
              </select>
            </div>
            {form.frequency === 'weekly' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Day of week</label>
                <div className="flex gap-1.5">
                  {DAYS.map((d, i) => (
                    <button key={d} onClick={() => setForm(f => ({ ...f, dayOfWeek: i }))} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${form.dayOfWeek === i ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}>{d}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Destination</label>
              <div className="flex gap-2">
                <button onClick={() => setForm(f => ({ ...f, destination: 'download' }))} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.destination === 'download' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>⬇ Download</button>
                {emailConn && <button onClick={() => setForm(f => ({ ...f, destination: 'email' }))} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${form.destination === 'email' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>✉ Email ({emailConn.label})</button>}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} disabled={!form.name?.trim()} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold transition-colors">Create Schedule</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Schedule list */}
      {schedules.length === 0 ? (
        <EmptyState icon={Clock} title="No schedules yet" desc="Set up automated exports and never forget to back up your data." />
      ) : (
        <div className="space-y-3">
          {schedules.map(s => (
            <div key={s.id} className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${s.enabled ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-sm truncate">{s.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${formatBadge(s.format).bg}`}>{s.format}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="capitalize">{s.frequency} · {String(s.hour).padStart(2, '0')}:00{s.frequency === 'weekly' ? ` · ${DAYS[s.dayOfWeek ?? 1]}` : ''}</span>
                  <span>→ {destLabel(s.destination)}</span>
                  {s.enabled && <span className="text-indigo-500 font-medium">Next: {getNextRun(s)}</span>}
                </div>
              </div>
              <button onClick={() => toggleEnabled(s.id)} className="flex-shrink-0 text-slate-400 hover:text-indigo-600 transition-colors" title={s.enabled ? 'Pause' : 'Resume'}>
                {s.enabled ? <ToggleRight size={24} className="text-indigo-600" /> : <ToggleLeft size={24} />}
              </button>
              <button onClick={() => deleteSchedule(s.id)} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// History tab
// ═══════════════════════════════════════════════════════════════════════════════

function HistoryTab({ history, onClear }: { history: ExportRecord[]; onClear: () => void }) {
  const [filter, setFilter] = useState<'all' | 'download' | 'service'>('all');

  const filtered = history.filter(h => {
    if (filter === 'download') return h.destination === 'download';
    if (filter === 'service') return h.destination !== 'download';
    return true;
  });

  const formatIcon = { CSV: FileText, JSON: FileJson, PDF: Printer };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
          {(['all', 'download', 'service'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{f === 'service' ? 'Services' : f}</button>
          ))}
        </div>
        {history.length > 0 && (
          <button onClick={onClear} className="text-xs text-red-400 hover:text-red-600 transition-colors">Clear history</button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No export history" desc="Your export activity will appear here every time you export data." />
      ) : (
        <div className="space-y-2">
          {filtered.map(entry => {
            const Icon = formatIcon[entry.format];
            const fmtBadge = formatBadge(entry.format);
            return (
              <div key={entry.id} className="flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${fmtBadge.bg}`}>
                  <Icon size={16} className={fmtBadge.bg.includes('emerald') ? 'text-emerald-700' : fmtBadge.bg.includes('blue') ? 'text-blue-700' : 'text-rose-700'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800 truncate">{entry.label}</span>
                    {entry.status === 'error' && <AlertCircle size={13} className="text-red-400 flex-shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>{entry.recordCount} records</span>
                    <span>·</span>
                    <span>{formatCurrency(entry.totalAmount)}</span>
                    <span>·</span>
                    <span>{destLabel(entry.destination)}</span>
                    {entry.fileSize && <><span>·</span><span>{entry.fileSize}</span></>}
                  </div>
                </div>
                <div className="flex-shrink-0 text-xs text-slate-400">{relativeTime(entry.timestamp)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Share tab
// ═══════════════════════════════════════════════════════════════════════════════

function ShareTab({ sharedLinks, expenses, onRefresh }: {
  sharedLinks: SharedLink[];
  expenses: ReturnType<typeof useExpenses>['expenses'];
  onRefresh: () => void;
}) {
  const [creating, setCreating] = useState(false);
  const [label, setLabel] = useState('Monthly Report');
  const [format, setFormat] = useState<ExportFormat>('PDF');
  const [expiry, setExpiry] = useState<'7d' | '30d' | 'never'>('7d');
  const [copied, setCopied] = useState<string | null>(null);
  const [newLink, setNewLink] = useState<SharedLink | null>(null);

  function expiryDate(e: '7d' | '30d' | 'never') {
    if (e === 'never') return undefined;
    const d = new Date();
    d.setDate(d.getDate() + (e === '7d' ? 7 : 30));
    return d.toISOString();
  }

  async function handleCreate() {
    setCreating(true);
    await sleep(900);
    const link = createSharedLink({ label, format, expiresAt: expiryDate(expiry) });
    setNewLink(link);
    setCreating(false);
    onRefresh();
  }

  function getURL(code: string) {
    return `https://expensetracker.app/shared/${code}`;
  }

  async function copyURL(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const active = sharedLinks.filter(l => l.active);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2"><Link2 size={15} className="text-indigo-500" /> Create Shareable Link</h3>
        <p className="text-xs text-slate-400 mb-4">Generate a link anyone can use to view or download your report.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Report name</label>
            <input value={label} onChange={e => setLabel(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Format</label>
            <div className="flex gap-2">
              {(['CSV', 'JSON', 'PDF'] as const).map(f => {
                const b = formatBadge(f);
                return <button key={f} onClick={() => setFormat(f)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${format === f ? `${b.bg} border-current` : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{f}</button>;
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Link expires</label>
            <div className="flex gap-2">
              {([['7d', '7 days'], ['30d', '30 days'], ['never', 'Never']] as const).map(([k, lbl]) => (
                <button key={k} onClick={() => setExpiry(k)} className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${expiry === k ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200'}`}>{lbl}</button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={creating || !label.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-semibold transition-colors"
          >
            {creating ? <><Loader2 size={14} className="animate-spin" /> Creating link…</> : <><Link2 size={14} /> Generate Link</>}
          </button>
        </div>

        {/* New link result */}
        {newLink && (
          <div className="mt-4 p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-800"><Check size={15} /> Link created!</div>
            <div className="flex items-center gap-2">
              <input readOnly value={getURL(newLink.shortCode)} className="flex-1 px-2.5 py-2 text-xs rounded-lg bg-white border border-indigo-200 text-slate-700 outline-none font-mono" />
              <button onClick={() => copyURL(getURL(newLink.shortCode))} className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex-shrink-0">
                {copied === getURL(newLink.shortCode) ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="flex justify-center">
              <div>
                <QRCode value={getURL(newLink.shortCode)} />
                <p className="text-center text-[10px] text-indigo-400 mt-1">Scan to open (preview)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active links panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-1 flex items-center gap-2"><ExternalLink size={15} className="text-indigo-500" /> Active Links</h3>
        <p className="text-xs text-slate-400 mb-4">{active.length} link{active.length !== 1 ? 's' : ''} currently active</p>

        {active.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Link2 size={28} className="text-slate-200 mb-2" />
            <p className="text-sm text-slate-400">No active links yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map(link => {
              const url = getURL(link.shortCode);
              const fmtBadge = formatBadge(link.format as ExportFormat);
              return (
                <div key={link.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium text-slate-800">{link.label}</span>
                      <span className={`ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded ${fmtBadge.bg}`}>{link.format}</span>
                    </div>
                    <button onClick={() => { revokeSharedLink(link.id); onRefresh(); }} className="p-1 rounded hover:bg-red-50 hover:text-red-500 text-slate-300 transition-colors" title="Revoke link">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-[11px] font-mono text-slate-500 truncate">{url}</span>
                    <button onClick={() => copyURL(url)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0">
                      {copied === url ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span>Created {relativeTime(link.createdAt)}</span>
                    {link.expiresAt && <span>· Expires {formatDate(link.expiresAt.slice(0, 10))}</span>}
                    {!link.expiresAt && <span>· Never expires</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
        <Icon size={22} className="text-slate-300" />
      </div>
      <p className="font-medium text-slate-600 mb-1">{title}</p>
      <p className="text-sm text-slate-400 max-w-xs">{desc}</p>
    </div>
  );
}
