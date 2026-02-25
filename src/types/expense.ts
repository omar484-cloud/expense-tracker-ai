export type Category =
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'other';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: string; // YYYY-MM-DD
  createdAt: string;
  raw?: string; // original typed text
}

export interface Budget {
  [key: string]: number;
}

export const CATEGORIES: Category[] = [
  'food',
  'transport',
  'entertainment',
  'shopping',
  'bills',
  'health',
  'other',
];

export const CATEGORY_META: Record<
  Category,
  { label: string; color: string; bg: string; keywords: string[]; emoji: string }
> = {
  food: {
    label: 'Food & Drink',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    keywords: [
      'coffee', 'lunch', 'dinner', 'breakfast', 'restaurant', 'cafe', 'food',
      'eat', 'meal', 'pizza', 'burger', 'sushi', 'bar', 'drink', 'beer',
      'starbucks', 'chipotle', 'mcdonalds', 'grocery', 'groceries',
      'whole foods', 'trader joe', 'doordash', 'ubereats', 'grubhub',
      'takeout', 'snack', 'bakery', 'brunch', 'taco', 'sandwich',
    ],
    emoji: '🍕',
  },
  transport: {
    label: 'Transport',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.12)',
    keywords: [
      'uber', 'lyft', 'gas', 'parking', 'metro', 'bus', 'train', 'subway',
      'taxi', 'car', 'fuel', 'transit', 'flight', 'airline', 'travel',
      'toll', 'bike', 'scooter', 'rental', 'airport',
    ],
    emoji: '🚗',
  },
  entertainment: {
    label: 'Entertainment',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    keywords: [
      'netflix', 'spotify', 'movie', 'cinema', 'game', 'gaming', 'concert',
      'show', 'ticket', 'museum', 'amazon prime', 'hulu', 'disney', 'youtube',
      'twitch', 'steam', 'apple tv', 'hbo', 'max', 'paramount', 'peacock',
    ],
    emoji: '🎮',
  },
  shopping: {
    label: 'Shopping',
    color: '#f472b6',
    bg: 'rgba(244,114,182,0.12)',
    keywords: [
      'amazon', 'clothes', 'clothing', 'shoes', 'shirt', 'pants', 'dress',
      'shop', 'store', 'target', 'walmart', 'mall', 'online', 'order',
      'bought', 'ikea', 'ebay', 'etsy', 'h&m', 'zara',
    ],
    emoji: '🛍️',
  },
  bills: {
    label: 'Bills',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
    keywords: [
      'rent', 'electric', 'electricity', 'water', 'internet', 'phone',
      'utility', 'insurance', 'subscription', 'bill', 'mortgage', 'gym',
      'membership', 'comcast', 'verizon', 'at&t', 'cable',
    ],
    emoji: '📋',
  },
  health: {
    label: 'Health',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    keywords: [
      'doctor', 'pharmacy', 'medicine', 'gym', 'fitness', 'hospital',
      'dental', 'health', 'medical', 'cvs', 'walgreens', 'prescription',
      'workout', 'vitamin', 'therapy', 'dentist',
    ],
    emoji: '💊',
  },
  other: {
    label: 'Other',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.12)',
    keywords: [],
    emoji: '📌',
  },
};

export const DEFAULT_BUDGETS: Budget = {
  food: 400,
  transport: 150,
  entertainment: 100,
  shopping: 200,
  bills: 800,
  health: 100,
  other: 150,
};
