export type Category =
  | 'Food'
  | 'Transportation'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  search: string;
  category: Category | 'All';
  dateFrom: string;
  dateTo: string;
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
  preset: 'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear' | 'custom';
}

export const CATEGORIES: Category[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f97316',
  Transportation: '#3b82f6',
  Entertainment: '#a855f7',
  Shopping: '#ec4899',
  Bills: '#ef4444',
  Other: '#6b7280',
};

export const CATEGORY_LIGHT_COLORS: Record<Category, string> = {
  Food: '#fff7ed',
  Transportation: '#eff6ff',
  Entertainment: '#faf5ff',
  Shopping: '#fdf2f8',
  Bills: '#fff1f2',
  Other: '#f9fafb',
};

export const CATEGORY_TEXT_COLORS: Record<Category, string> = {
  Food: 'text-orange-600',
  Transportation: 'text-blue-600',
  Entertainment: 'text-purple-600',
  Shopping: 'text-pink-600',
  Bills: 'text-red-600',
  Other: 'text-gray-600',
};

export const CATEGORY_BADGE_CLASSES: Record<Category, string> = {
  Food: 'bg-orange-100 text-orange-700 ring-orange-200',
  Transportation: 'bg-blue-100 text-blue-700 ring-blue-200',
  Entertainment: 'bg-purple-100 text-purple-700 ring-purple-200',
  Shopping: 'bg-pink-100 text-pink-700 ring-pink-200',
  Bills: 'bg-red-100 text-red-700 ring-red-200',
  Other: 'bg-gray-100 text-gray-700 ring-gray-200',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  Food: '🍔',
  Transportation: '🚗',
  Entertainment: '🎬',
  Shopping: '🛍️',
  Bills: '📄',
  Other: '📦',
};
