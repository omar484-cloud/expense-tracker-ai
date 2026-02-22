'use client';

import { TrendingUp, TrendingDown, DollarSign, Calendar, Tag, Receipt } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { getStats } from '@/utils/calculations';
import { formatCurrency, formatMonthYear, getMonthStart } from '@/utils/formatters';
import { CATEGORY_ICONS } from '@/types/expense';

export default function SummaryCards() {
  const { expenses } = useExpenses();
  const stats = getStats(expenses);

  const cards = [
    {
      title: 'Total Spent',
      value: formatCurrency(stats.totalAll),
      subtitle: `${stats.expenseCount} expenses total`,
      icon: DollarSign,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      accent: 'border-indigo-200',
    },
    {
      title: 'This Month',
      value: formatCurrency(stats.totalThisMonth),
      subtitle:
        stats.monthlyChange !== 0
          ? `${Math.abs(stats.monthlyChange).toFixed(1)}% ${stats.monthlyChange >= 0 ? 'more' : 'less'} than last month`
          : 'No change from last month',
      icon: Calendar,
      iconBg: 'bg-violet-100',
      iconColor: 'text-violet-600',
      accent: 'border-violet-200',
      trend: stats.monthlyChange,
    },
    {
      title: 'Avg / Day',
      value: formatCurrency(stats.avgPerDay),
      subtitle: formatMonthYear(getMonthStart(0)),
      icon: Receipt,
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      accent: 'border-sky-200',
    },
    {
      title: 'Top Category',
      value: stats.topCategory
        ? `${CATEGORY_ICONS[stats.topCategory]} ${stats.topCategory}`
        : '—',
      subtitle: stats.topCategory
        ? formatCurrency(stats.topCategoryAmount) + ' this month'
        : 'No data yet',
      icon: Tag,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      accent: 'border-rose-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${card.accent}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon size={18} className={card.iconColor} />
              </div>
              {card.trend !== undefined && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    card.trend <= 0
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {card.trend <= 0 ? (
                    <TrendingDown size={12} />
                  ) : (
                    <TrendingUp size={12} />
                  )}
                  {Math.abs(card.trend).toFixed(0)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1 leading-tight">{card.value}</p>
            <p className="text-xs text-slate-500 leading-snug">{card.subtitle}</p>
            <p className="text-xs font-medium text-slate-400 mt-2">{card.title}</p>
          </div>
        );
      })}
    </div>
  );
}
