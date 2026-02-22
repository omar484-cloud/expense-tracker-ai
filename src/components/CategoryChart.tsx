'use client';

import { useExpenses } from '@/context/ExpenseContext';
import { getCategoryBreakdown } from '@/utils/calculations';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/types/expense';
import { formatCurrency } from '@/utils/formatters';

function DonutChart({
  data,
}: {
  data: { category: string; percentage: number; color: string }[];
}) {
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 55;
  const gap = 2;

  let cumulative = 0;
  const slices = data.map((d) => {
    const startAngle = cumulative * 3.6 - 90;
    const endAngle = (cumulative + d.percentage) * 3.6 - 90;
    cumulative += d.percentage;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle + gap / 2));
    const y1 = cy + r * Math.sin(toRad(startAngle + gap / 2));
    const x2 = cx + r * Math.cos(toRad(endAngle - gap / 2));
    const y2 = cy + r * Math.sin(toRad(endAngle - gap / 2));
    const largeArc = d.percentage > 50 ? 1 : 0;

    return {
      ...d,
      path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {slices.map((s) => (
        <path
          key={s.category}
          d={s.path}
          fill={s.color}
          className="transition-opacity hover:opacity-80"
        />
      ))}
      {/* Center hole */}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="white" />
    </svg>
  );
}

export default function CategoryChart() {
  const { expenses } = useExpenses();
  const breakdown = getCategoryBreakdown(expenses);

  if (breakdown.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Spending by Category</h3>
        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
          <p className="text-sm">No data yet</p>
        </div>
      </div>
    );
  }

  const chartData = breakdown.map((d) => ({
    category: d.category,
    percentage: d.percentage,
    color: CATEGORY_COLORS[d.category],
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Spending by Category</h3>

      <DonutChart data={chartData} />

      <div className="mt-5 space-y-2">
        {breakdown.map((d) => (
          <div key={d.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: CATEGORY_COLORS[d.category] }}
              />
              <span className="text-slate-600 truncate">
                {CATEGORY_ICONS[d.category]} {d.category}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-slate-900 font-medium">{formatCurrency(d.total)}</span>
              <span className="text-slate-400 text-xs w-10 text-right">
                {d.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
