import { Expense, Category, CATEGORY_COLORS } from '@/types/expense';
import { formatDate, formatCurrency } from './formatters';

// ─── Shared helpers ────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export interface ExportMeta {
  exportedAt: string;
  dateRange: string;
  totalRecords: number;
  totalAmount: number;
}

// ─── CSV ───────────────────────────────────────────────────────────────────────

export function exportCSV(expenses: Expense[], filename: string, meta: ExportMeta): void {
  const lines: string[] = [];

  // Metadata header block (commented rows so it stays valid CSV)
  lines.push(`# Expense Report`);
  lines.push(`# Exported: ${new Date(meta.exportedAt).toLocaleString()}`);
  lines.push(`# Date Range: ${meta.dateRange}`);
  lines.push(`# Records: ${meta.totalRecords} | Total: ${formatCurrency(meta.totalAmount)}`);
  lines.push('');

  // Column headers
  lines.push(['Date', 'Amount', 'Category', 'Description', 'Created At'].join(','));

  // Data rows
  for (const e of expenses) {
    lines.push([
      escapeCSVField(formatDate(e.date)),
      e.amount.toFixed(2),
      escapeCSVField(e.category),
      escapeCSVField(e.description),
      escapeCSVField(new Date(e.createdAt).toLocaleString()),
    ].join(','));
  }

  // Summary row
  lines.push('');
  lines.push(['TOTAL', meta.totalAmount.toFixed(2), '', '', ''].join(','));

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

export function exportJSON(expenses: Expense[], filename: string, meta: ExportMeta): void {
  const payload = {
    meta: {
      exportedAt: meta.exportedAt,
      dateRange: meta.dateRange,
      totalRecords: meta.totalRecords,
      totalAmount: meta.totalAmount,
      generator: 'ExpenseTracker AI',
    },
    summary: buildCategorySummary(expenses),
    expenses: expenses.map(e => ({
      id: e.id,
      date: e.date,
      amount: e.amount,
      category: e.category,
      description: e.description,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  downloadBlob(blob, filename);
}

// ─── PDF (print-to-PDF via styled popup window) ────────────────────────────────

export function exportPDF(expenses: Expense[], _filename: string, meta: ExportMeta): void {
  const categorySummary = buildCategorySummary(expenses);

  const categoryBadgeStyle = (cat: Category) => {
    const color = CATEGORY_COLORS[cat] ?? '#6b7280';
    return `background:${color}18;color:${color};border:1px solid ${color}44;`;
  };

  const rows = expenses.map((e, i) => `
    <tr class="${i % 2 === 0 ? 'even' : ''}">
      <td>${formatDate(e.date)}</td>
      <td><span class="badge" style="${categoryBadgeStyle(e.category)}">${e.category}</span></td>
      <td class="desc">${e.description || '—'}</td>
      <td class="amount">${formatCurrency(e.amount)}</td>
    </tr>`).join('');

  const summaryRows = Object.entries(categorySummary)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([cat, { count, total }]) => `
      <tr>
        <td><span class="badge" style="${categoryBadgeStyle(cat as Category)}">${cat}</span></td>
        <td class="amount">${count}</td>
        <td class="amount">${formatCurrency(total)}</td>
      </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Expense Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @page { margin: 0.75in; size: A4; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; font-size: 13px; line-height: 1.5; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 24px; }
  .header-left h1 { font-size: 22px; font-weight: 700; color: #4f46e5; letter-spacing: -0.02em; }
  .header-left p { color: #64748b; font-size: 12px; margin-top: 4px; }
  .header-right { text-align: right; }
  .total-amount { font-size: 28px; font-weight: 700; color: #1e293b; }
  .total-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; }

  .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
  .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
  .meta-card .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 4px; }
  .meta-card .value { font-size: 15px; font-weight: 600; color: #1e293b; }

  h2 { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 10px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f8fafc; text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
  td { padding: 9px 12px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  tr.even td { background: #fafbfc; }
  .amount { text-align: right; font-weight: 500; font-variant-numeric: tabular-nums; }
  .desc { max-width: 260px; color: #475569; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 500; white-space: nowrap; }

  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none; }
  }
  .print-btn { display: block; margin: 0 auto 24px; padding: 10px 32px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">⬇ Save as PDF / Print</button>

  <div class="header">
    <div class="header-left">
      <h1>Expense Report</h1>
      <p>Generated ${new Date(meta.exportedAt).toLocaleString()} · ${meta.dateRange}</p>
    </div>
    <div class="header-right">
      <div class="total-label">Total Spent</div>
      <div class="total-amount">${formatCurrency(meta.totalAmount)}</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-card">
      <div class="label">Total Records</div>
      <div class="value">${meta.totalRecords}</div>
    </div>
    <div class="meta-card">
      <div class="label">Date Range</div>
      <div class="value">${meta.dateRange}</div>
    </div>
    <div class="meta-card">
      <div class="label">Avg per Record</div>
      <div class="value">${meta.totalRecords > 0 ? formatCurrency(meta.totalAmount / meta.totalRecords) : '$0.00'}</div>
    </div>
  </div>

  <h2>Category Breakdown</h2>
  <table>
    <thead>
      <tr><th>Category</th><th class="amount">Count</th><th class="amount">Total</th></tr>
    </thead>
    <tbody>${summaryRows}</tbody>
  </table>

  <h2>Expense Detail</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Category</th><th>Description</th><th class="amount">Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td colspan="3" style="text-align:right;font-weight:600;padding:10px 12px;border-top:2px solid #e2e8f0;">Total</td>
        <td class="amount" style="font-weight:700;font-size:15px;border-top:2px solid #e2e8f0;">${formatCurrency(meta.totalAmount)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>ExpenseTracker AI · Data stored locally in your browser</span>
    <span>Exported ${new Date(meta.exportedAt).toLocaleDateString()}</span>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    // Fallback: download as HTML file
    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    downloadBlob(blob, _filename.replace('.pdf', '.html'));
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function buildCategorySummary(
  expenses: Expense[],
): Record<string, { count: number; total: number }> {
  const summary: Record<string, { count: number; total: number }> = {};
  for (const e of expenses) {
    if (!summary[e.category]) summary[e.category] = { count: 0, total: 0 };
    summary[e.category].count++;
    summary[e.category].total += e.amount;
  }
  return summary;
}
