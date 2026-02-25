import { Category, CATEGORY_META } from '@/types/expense';

export interface ParseResult {
  amount: number | null;
  description: string;
  category: Category;
  date: Date;
  confidence: 'high' | 'medium' | 'low';
  raw: string;
}

// ─── Amount parsing ────────────────────────────────────────────────────────────

function parseAmount(text: string): { amount: number | null; remaining: string } {
  // "$45" or "$45.99"
  let m = text.match(/\$\s*(\d{1,6}(?:\.\d{1,2})?)/);
  if (m) return { amount: parseFloat(m[1]), remaining: text.replace(m[0], '').trim() };

  // "45 dollars" or "45 bucks"
  m = text.match(/(\d{1,6}(?:\.\d{1,2})?)\s*(?:dollars?|bucks?)\b/i);
  if (m) return { amount: parseFloat(m[1]), remaining: text.replace(m[0], '').trim() };

  // bare number that looks like a price (allow only one bare number per parse)
  m = text.match(/\b(\d{1,5}(?:\.\d{1,2})?)\b/);
  if (m) {
    const amt = parseFloat(m[1]);
    if (amt > 0 && amt < 100000) {
      return { amount: amt, remaining: text.replace(m[0], '').trim() };
    }
  }

  return { amount: null, remaining: text };
}

// ─── Date parsing ──────────────────────────────────────────────────────────────

function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(text: string): { date: Date; remaining: string } {
  const now = today();

  // "today", "this morning/afternoon/evening/tonight"
  if (/\b(today|this\s+morning|this\s+afternoon|this\s+evening|tonight)\b/i.test(text)) {
    return {
      date: now,
      remaining: text.replace(/\b(today|this\s+morning|this\s+afternoon|this\s+evening|tonight)\b/gi, '').trim(),
    };
  }

  // "yesterday"
  if (/\byesterday\b/i.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() - 1);
    return { date: d, remaining: text.replace(/\byesterday\b/gi, '').trim() };
  }

  // "N days ago"
  const daysAgo = text.match(/(\d+)\s+days?\s+ago/i);
  if (daysAgo) {
    const d = new Date(now);
    d.setDate(d.getDate() - parseInt(daysAgo[1]));
    return { date: d, remaining: text.replace(daysAgo[0], '').trim() };
  }

  // "last Monday" etc.
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const lastDay = text.match(/last\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (lastDay) {
    const target = DAYS.indexOf(lastDay[1].toLowerCase());
    const d = new Date(now);
    let diff = d.getDay() - target;
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() - diff - 7);
    return { date: d, remaining: text.replace(lastDay[0], '').trim() };
  }

  // bare day name "Monday", "Tuesday" = this past instance
  const dayName = text.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (dayName) {
    const target = DAYS.indexOf(dayName[1].toLowerCase());
    const d = new Date(now);
    let diff = d.getDay() - target;
    if (diff < 0) diff += 7;
    d.setDate(d.getDate() - diff);
    return { date: d, remaining: text.replace(dayName[0], '').trim() };
  }

  // "Jan 5", "January 5th"
  const monthDay = text.match(
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  );
  if (monthDay) {
    const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const mi = MONTHS.findIndex(m => monthDay[1].toLowerCase().startsWith(m));
    const d = new Date(now.getFullYear(), mi, parseInt(monthDay[2]));
    if (d > now) d.setFullYear(d.getFullYear() - 1);
    return { date: d, remaining: text.replace(monthDay[0], '').trim() };
  }

  // "12/25" or "1/5/25"
  const slashDate = text.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (slashDate) {
    const month = parseInt(slashDate[1]) - 1;
    const day = parseInt(slashDate[2]);
    const yr = slashDate[3] ? parseInt(slashDate[3]) : now.getFullYear();
    const d = new Date(yr < 100 ? 2000 + yr : yr, month, day);
    return { date: d, remaining: text.replace(slashDate[0], '').trim() };
  }

  return { date: now, remaining: text };
}

// ─── Category inference ────────────────────────────────────────────────────────

function inferCategory(text: string): Category {
  const lower = text.toLowerCase();
  for (const [cat, meta] of Object.entries(CATEGORY_META)) {
    if (cat === 'other') continue;
    if (meta.keywords.some(kw => lower.includes(kw))) {
      return cat as Category;
    }
  }
  return 'other';
}

// ─── Description cleaning ──────────────────────────────────────────────────────

function cleanDescription(text: string): string {
  return text
    .replace(/\b(at|from|for|on|in|a|an|the|my|i|spent|bought|paid|got|had)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Single expense parse ──────────────────────────────────────────────────────

export function parseExpense(raw: string): ParseResult | null {
  const text = raw.trim();
  if (!text) return null;

  const { amount, remaining: afterAmount } = parseAmount(text);
  const { date, remaining: afterDate } = parseDate(afterAmount);
  const description = cleanDescription(afterDate) || cleanDescription(text) || 'Expense';
  const category = inferCategory(text);

  const confidence: ParseResult['confidence'] =
    amount !== null
      ? category !== 'other'
        ? 'high'
        : 'medium'
      : 'low';

  return { amount, description, category, date, confidence, raw };
}

// ─── "X and Y" multi-expense split ────────────────────────────────────────────

export function parseMultiExpense(raw: string): ParseResult[] {
  // Split on " and " but only if each side looks like it has an amount
  const parts = raw.split(/\s+and\s+/i);
  if (parts.length > 1) {
    const results = parts.map(p => parseExpense(p.trim())).filter((r): r is ParseResult => r !== null && r.amount !== null);
    if (results.length === parts.length) return results;
  }
  const single = parseExpense(raw);
  return single ? [single] : [];
}

// ─── Batch parse (bank statement paste) ───────────────────────────────────────

export function parseBatch(text: string): ParseResult[] {
  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length <= 1) return [];

  const results: ParseResult[] = [];

  for (const line of lines) {
    // Bank statement: "12/15 STARBUCKS -4.50" or "2025-12-15  STARBUCKS  4.50"
    const bankMatch = line.match(
      /^(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?)\s+(.+?)\s+(-?\$?\d+(?:\.\d{2})?)$/,
    );
    if (bankMatch) {
      const rawAmt = bankMatch[3].replace(/[$-]/g, '');
      const amt = parseFloat(rawAmt);
      if (amt > 0) {
        const parsed = parseExpense(`${bankMatch[2]} $${amt} ${bankMatch[1]}`);
        if (parsed) {
          parsed.raw = line;
          results.push(parsed);
        }
      }
      continue;
    }

    // Try "and"-split or regular NL
    const multi = parseMultiExpense(line);
    results.push(...multi.filter(r => r.amount !== null));
  }

  return results;
}
