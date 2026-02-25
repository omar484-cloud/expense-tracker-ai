import { Expense, Category } from '@/types/expense';

export interface SpendingPersona {
  title: string;
  description: string;
  emoji: string;
}

const PERSONAS: Record<string, SpendingPersona[]> = {
  food: [
    { title: 'The Foodie', description: "Your wallet has a Yelp profile. You live to eat.", emoji: '🍽️' },
    { title: 'The Culinary Explorer', description: 'Restaurants are your second home. Chefs know your order.', emoji: '👨‍🍳' },
  ],
  transport: [
    { title: 'The Road Warrior', description: "Life is a journey and you're proving it financially.", emoji: '🛣️' },
    { title: 'The Urban Nomad', description: 'Your Uber rating is impeccable. The city is your oyster.', emoji: '🗺️' },
  ],
  entertainment: [
    { title: 'The Entertainer', description: "At least you're having fun. That's worth something.", emoji: '🎭' },
    { title: 'The Subscription Collector', description: "You're single-handedly keeping streaming alive.", emoji: '👑' },
  ],
  shopping: [
    { title: 'The Retail Therapist', description: 'When in doubt, add to cart. Therapy is expensive anyway.', emoji: '🛒' },
    { title: 'The Shopaholic', description: 'Amazon\'s quarterly profits correlate with your mood.', emoji: '💳' },
  ],
  bills: [
    { title: 'The Responsible Adult', description: 'Bills paid on time, every time. Peak adulting.', emoji: '🏠' },
    { title: 'The Obligationist', description: 'You honor your commitments. Also your lease.', emoji: '💼' },
  ],
  health: [
    { title: 'The Wellness Guru', description: 'Investing in yourself. Your future self is grateful.', emoji: '🧘' },
    { title: 'The Health Investor', description: 'Your body is your most expensive — and best — asset.', emoji: '💪' },
  ],
  other: [
    { title: 'The Wildcard', description: 'Your spending is beautifully uncategorizable. A mystery.', emoji: '🎲' },
  ],
};

export function getSpendingPersona(expenses: Expense[]): SpendingPersona {
  if (!expenses.length) {
    return { title: 'The Blank Slate', description: "Your financial story hasn't started yet. Just start typing.", emoji: '📄' };
  }

  const totals: Record<string, number> = {};
  let total = 0;
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
    total += e.amount;
  }
  void total;

  const topCat = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  const pool = PERSONAS[topCat] ?? PERSONAS.other;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getCategoryTotals(expenses: Expense[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  }
  return totals;
}

export function getMonthTotal(expenses: Expense[], year: number, month: number): number {
  const prefix = `${year}-${String(month).padStart(2, '0')}`;
  return expenses
    .filter(e => e.date.startsWith(prefix))
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getDailyAverage(expenses: Expense[]): number {
  if (!expenses.length) return 0;
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const dates = expenses.map(e => e.date).sort();
  const days = Math.max(
    1,
    Math.round(
      (new Date(dates[dates.length - 1]).getTime() - new Date(dates[0]).getTime()) /
        86400000,
    ) + 1,
  );
  return total / days;
}

export function groupByDate(expenses: Expense[]): { label: string; date: string; items: Expense[] }[] {
  const map = new Map<string, Expense[]>();
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date));
  for (const e of sorted) {
    const group = map.get(e.date) ?? [];
    group.push(e);
    map.set(e.date, group);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return Array.from(map.entries()).map(([date, items]) => {
    const d = new Date(date + 'T00:00:00');
    let label: string;
    if (d.getTime() === today.getTime()) label = 'Today';
    else if (d.getTime() === yesterday.getTime()) label = 'Yesterday';
    else {
      label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    return { label, date, items };
  });
}

export function generateSampleData(): { amount: number; description: string; category: Category; date: string }[] {
  const today = new Date();
  const offset = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  return [
    { amount: 4.5, description: 'Starbucks latte', category: 'food', date: offset(0) },
    { amount: 18.5, description: 'Uber to work', category: 'transport', date: offset(0) },
    { amount: 32.0, description: 'Lunch with team', category: 'food', date: offset(1) },
    { amount: 15.99, description: 'Netflix subscription', category: 'entertainment', date: offset(1) },
    { amount: 67.45, description: 'Whole Foods groceries', category: 'food', date: offset(2) },
    { amount: 9.5, description: 'Subway card top-up', category: 'transport', date: offset(3) },
    { amount: 1250.0, description: 'Monthly rent', category: 'bills', date: offset(4) },
    { amount: 24.99, description: 'Amazon book order', category: 'shopping', date: offset(4) },
    { amount: 55.0, description: 'Doctor copay', category: 'health', date: offset(5) },
    { amount: 12.0, description: 'Spotify family plan', category: 'entertainment', date: offset(6) },
    { amount: 8.75, description: 'Coffee and bagel', category: 'food', date: offset(7) },
    { amount: 42.0, description: 'Gas station fill-up', category: 'transport', date: offset(7) },
    { amount: 89.99, description: 'New running shoes', category: 'shopping', date: offset(8) },
    { amount: 23.5, description: 'Thai takeout', category: 'food', date: offset(9) },
    { amount: 120.0, description: 'Electric bill', category: 'bills', date: offset(10) },
    { amount: 6.5, description: 'Morning coffee', category: 'food', date: offset(11) },
    { amount: 35.0, description: 'Lyft to airport', category: 'transport', date: offset(12) },
    { amount: 14.99, description: 'Hulu subscription', category: 'entertainment', date: offset(13) },
    { amount: 78.0, description: 'Target run', category: 'shopping', date: offset(14) },
    { amount: 11.0, description: 'Burrito bowl', category: 'food', date: offset(14) },
  ];
}
