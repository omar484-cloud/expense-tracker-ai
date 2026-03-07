import { Expense, Category, CATEGORY_COLORS } from '@/types/expense';
import { formatCurrency, formatDate } from './formatters';

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvEscape(v: string) {
  return v.includes(',') || v.includes('"') || v.includes('\n')
    ? `"${v.replace(/"/g, '""')}"`
    : v;
}

function categorySummary(expenses: Expense[]) {
  const m: Record<string, { count: number; total: number }> = {};
  for (const e of expenses) {
    if (!m[e.category]) m[e.category] = { count: 0, total: 0 };
    m[e.category].count++;
    m[e.category].total += e.amount;
  }
  return m;
}

// ─── CSV ───────────────────────────────────────────────────────────────────────

export function downloadCSV(expenses: Expense[], filename: string, label = 'Expense Export') {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const lines = [
    `# ${label}`,
    `# Generated: ${new Date().toLocaleString()}  |  Records: ${expenses.length}  |  Total: ${formatCurrency(total)}`,
    '',
    ['Date', 'Category', 'Description', 'Amount'].join(','),
    ...expenses.map(e =>
      [
        csvEscape(formatDate(e.date)),
        csvEscape(e.category),
        csvEscape(e.description),
        e.amount.toFixed(2),
      ].join(','),
    ),
    '',
    `TOTAL,,,${ total.toFixed(2)}`,
  ];
  download(new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' }), filename);
}

// ─── JSON ──────────────────────────────────────────────────────────────────────

export function downloadJSON(expenses: Expense[], filename: string, label = 'Expense Export') {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const payload = {
    meta: {
      label,
      exportedAt: new Date().toISOString(),
      recordCount: expenses.length,
      totalAmount: total,
      generator: 'ExpenseTracker AI',
    },
    summary: categorySummary(expenses),
    expenses,
  };
  download(
    new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' }),
    filename,
  );
}

// ─── PDF (print popup) ─────────────────────────────────────────────────────────

export function openPDFReport(
  expenses: Expense[],
  label = 'Expense Report',
  subtitle = '',
) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const summary = categorySummary(expenses);

  const badge = (cat: Category) => {
    const c = CATEGORY_COLORS[cat] ?? '#6b7280';
    return `background:${c}18;color:${c};border:1px solid ${c}44;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:500`;
  };

  const summaryRows = Object.entries(summary)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([cat, { count, total: t }]) =>
      `<tr><td><span style="${badge(cat as Category)}">${cat}</span></td><td class="r">${count}</td><td class="r">${formatCurrency(t)}</td><td class="r">${((t / total) * 100).toFixed(1)}%</td></tr>`,
    )
    .join('');

  const rows = expenses
    .map((e, i) =>
      `<tr class="${i % 2 ? 'alt' : ''}"><td>${formatDate(e.date)}</td><td><span style="${badge(e.category)}">${e.category}</span></td><td class="desc">${e.description || '—'}</td><td class="r mono">${formatCurrency(e.amount)}</td></tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>${label}</title>
<style>
  @page{margin:.75in;size:A4}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1e293b;font-size:13px;line-height:1.5}
  .btn{display:block;margin:0 auto 20px;padding:10px 28px;background:#4f46e5;color:#fff;border:0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
  @media print{.btn{display:none}}
  .top{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid #e2e8f0;margin-bottom:20px}
  h1{font-size:20px;font-weight:700;color:#4f46e5}
  .sub{color:#64748b;font-size:12px;margin-top:4px}
  .kpi{text-align:right}
  .kpi-val{font-size:26px;font-weight:700}
  .kpi-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px}
  .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px}
  .card .lbl{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#94a3b8;margin-bottom:3px}
  .card .val{font-size:15px;font-weight:600}
  h2{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:8px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12px}
  th{background:#f8fafc;text-align:left;padding:7px 10px;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#64748b;border-bottom:2px solid #e2e8f0;font-weight:600}
  td{padding:8px 10px;border-bottom:1px solid #f1f5f9}
  .alt td{background:#fafbfc}
  .r{text-align:right}
  .mono{font-variant-numeric:tabular-nums}
  .desc{max-width:200px;color:#475569;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  tfoot td{border-top:2px solid #e2e8f0;font-weight:700;font-size:14px}
  .foot{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#94a3b8}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<button class="btn" onclick="window.print()">⬇ Save as PDF / Print</button>
<div class="top">
  <div><h1>${label}</h1><p class="sub">${subtitle || `Generated ${new Date().toLocaleString()}`}</p></div>
  <div class="kpi"><div class="kpi-lbl">Total Spent</div><div class="kpi-val">${formatCurrency(total)}</div></div>
</div>
<div class="cards">
  <div class="card"><div class="lbl">Records</div><div class="val">${expenses.length}</div></div>
  <div class="card"><div class="lbl">Avg per Expense</div><div class="val">${expenses.length ? formatCurrency(total / expenses.length) : '$0'}</div></div>
  <div class="card"><div class="lbl">Categories</div><div class="val">${Object.keys(summary).length}</div></div>
</div>
<h2>Category Breakdown</h2>
<table><thead><tr><th>Category</th><th class="r">Count</th><th class="r">Total</th><th class="r">Share</th></tr></thead>
<tbody>${summaryRows}</tbody></table>
<h2>Expense Detail</h2>
<table><thead><tr><th>Date</th><th>Category</th><th>Description</th><th class="r">Amount</th></tr></thead>
<tbody>${rows}</tbody>
<tfoot><tr><td colspan="3" class="r">Total</td><td class="r mono">${formatCurrency(total)}</td></tr></tfoot></table>
<div class="foot"><span>ExpenseTracker AI · Data stored locally in your browser</span><span>Exported ${new Date().toLocaleDateString()}</span></div>
</body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700,toolbar=0,menubar=0');
  if (w) { w.document.write(html); w.document.close(); w.focus(); }
  else {
    download(new Blob([html], { type: 'text/html;charset=utf-8;' }), label.replace(/\s+/g, '-').toLowerCase() + '.html');
  }
}
