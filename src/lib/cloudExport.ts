// ─── Types ─────────────────────────────────────────────────────────────────────

export type ServiceId = 'email' | 'google-sheets' | 'dropbox' | 'onedrive' | 'notion' | 'slack';
export type ExportFormat = 'CSV' | 'JSON' | 'PDF';
export type ExportDestination = 'download' | ServiceId;

export interface Connection {
  service: ServiceId;
  connected: boolean;
  connectedAt?: string;
  label?: string;      // email address, channel, sheet name, etc.
  syncPath?: string;   // folder path for cloud storage
  lastSynced?: string;
}

export interface ExportRecord {
  id: string;
  timestamp: string;
  label: string;
  format: ExportFormat;
  destination: ExportDestination;
  recordCount: number;
  totalAmount: number;
  status: 'success' | 'error';
  fileSize?: string;
}

export interface Schedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  hour: number;
  dayOfWeek?: number; // 0=Sun … 6=Sat
  dayOfMonth?: number;
  format: ExportFormat;
  destination: ExportDestination;
  enabled: boolean;
  createdAt: string;
  lastRun?: string;
}

export interface SharedLink {
  id: string;
  label: string;
  shortCode: string;
  createdAt: string;
  expiresAt?: string;
  format: ExportFormat;
  views: number;
  active: boolean;
}

// ─── Storage keys ──────────────────────────────────────────────────────────────

const KEYS = {
  connections: 'et:cloud:connections',
  history:     'et:cloud:history',
  schedules:   'et:cloud:schedules',
  shares:      'et:cloud:shares',
};

// ─── Connections ───────────────────────────────────────────────────────────────

const DEFAULT_CONNECTIONS: Connection[] = [
  { service: 'email',         connected: false },
  { service: 'google-sheets', connected: false },
  { service: 'dropbox',       connected: false },
  { service: 'onedrive',      connected: false },
  { service: 'notion',        connected: false },
  { service: 'slack',         connected: false },
];

export function getConnections(): Connection[] {
  if (typeof window === 'undefined') return DEFAULT_CONNECTIONS;
  try {
    const raw = localStorage.getItem(KEYS.connections);
    return raw ? JSON.parse(raw) : DEFAULT_CONNECTIONS;
  } catch {
    return DEFAULT_CONNECTIONS;
  }
}

export function saveConnections(conns: Connection[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.connections, JSON.stringify(conns));
}

// ─── History ───────────────────────────────────────────────────────────────────

export function getHistory(): ExportRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.history);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<ExportRecord, 'id' | 'timestamp'>): ExportRecord {
  const record: ExportRecord = {
    ...entry,
    id: Math.random().toString(36).slice(2),
    timestamp: new Date().toISOString(),
  };
  const history = [record, ...getHistory()].slice(0, 100); // keep last 100
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.history, JSON.stringify(history));
  }
  return record;
}

export function clearHistory(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(KEYS.history);
}

// ─── Schedules ─────────────────────────────────────────────────────────────────

export function getSchedules(): Schedule[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.schedules);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSchedules(schedules: Schedule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.schedules, JSON.stringify(schedules));
}

export function addSchedule(s: Omit<Schedule, 'id' | 'createdAt'>): Schedule {
  const schedule: Schedule = {
    ...s,
    id: Math.random().toString(36).slice(2),
    createdAt: new Date().toISOString(),
  };
  saveSchedules([...getSchedules(), schedule]);
  return schedule;
}

// ─── Shared links ──────────────────────────────────────────────────────────────

export function getSharedLinks(): SharedLink[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEYS.shares);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function createSharedLink(opts: {
  label: string;
  format: ExportFormat;
  expiresAt?: string;
}): SharedLink {
  const link: SharedLink = {
    id: Math.random().toString(36).slice(2),
    shortCode: Math.random().toString(36).slice(2, 8),
    label: opts.label,
    format: opts.format,
    createdAt: new Date().toISOString(),
    expiresAt: opts.expiresAt,
    views: 0,
    active: true,
  };
  const existing = getSharedLinks();
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.shares, JSON.stringify([link, ...existing]));
  }
  return link;
}

export function revokeSharedLink(id: string): void {
  const updated = getSharedLinks().map(l => l.id === id ? { ...l, active: false } : l);
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEYS.shares, JSON.stringify(updated));
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Compute the next run date string from a schedule */
export function getNextRun(schedule: Schedule): string {
  const now = new Date();
  const next = new Date(now);
  next.setHours(schedule.hour, 0, 0, 0);

  if (schedule.frequency === 'daily') {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined) {
    const diff = (schedule.dayOfWeek - next.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + diff);
  } else if (schedule.frequency === 'monthly' && schedule.dayOfMonth !== undefined) {
    next.setDate(schedule.dayOfMonth);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }

  const diff = next.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(h / 24);
  if (d >= 1) return `in ${d}d ${h % 24}h`;
  if (h >= 1) return `in ${h}h`;
  return 'soon';
}

export function estimateFileSize(recordCount: number, format: ExportFormat): string {
  const bytesPerRecord = format === 'JSON' ? 280 : format === 'PDF' ? 600 : 120;
  const bytes = recordCount * bytesPerRecord + 512;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
