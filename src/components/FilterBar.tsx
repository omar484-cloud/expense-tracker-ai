'use client';

import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import { CATEGORIES } from '@/types/expense';

const PRESETS = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Last 3 Months', value: 'last3Months' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Custom', value: 'custom' },
] as const;

const SORT_OPTIONS = [
  { label: 'Date (Newest)', value: 'date-desc' },
  { label: 'Date (Oldest)', value: 'date-asc' },
  { label: 'Amount (High)', value: 'amount-desc' },
  { label: 'Amount (Low)', value: 'amount-asc' },
  { label: 'Category A-Z', value: 'category-asc' },
] as const;

export default function FilterBar() {
  const { filters, setFilters, resetFilters, filteredExpenses } = useExpenses();

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'All' ||
    filters.preset !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;

  const handleSortChange = (val: string) => {
    const [sortBy, sortOrder] = val.split('-') as [
      'date' | 'amount' | 'category',
      'asc' | 'desc',
    ];
    setFilters({ sortBy, sortOrder });
  };

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <div className="space-y-3">
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="pl-8 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => setFilters({ preset: p.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.preset === p.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      {filters.preset === 'custom' && (
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ dateFrom: e.target.value })}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ dateTo: e.target.value })}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilters({ category: 'All' })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            filters.category === 'All'
              ? 'bg-slate-800 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilters({ category: cat })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filters.category === cat
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results + clear */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
