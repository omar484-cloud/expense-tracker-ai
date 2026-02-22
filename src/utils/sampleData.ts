import { Expense, Category } from '@/types/expense';

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function randomDate(daysAgo: number, daysAgoEnd = 0): string {
  const offset = Math.floor(Math.random() * (daysAgo - daysAgoEnd + 1)) + daysAgoEnd;
  const d = new Date();
  d.setDate(d.getDate() - offset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const sampleExpenses: Array<{ amount: number; category: Category; description: string }> = [
  { amount: 12.5, category: 'Food', description: 'Coffee and pastry' },
  { amount: 45.8, category: 'Food', description: 'Grocery shopping' },
  { amount: 28.0, category: 'Food', description: 'Lunch with coworkers' },
  { amount: 89.99, category: 'Food', description: 'Weekly groceries' },
  { amount: 15.0, category: 'Food', description: 'Pizza delivery' },
  { amount: 32.5, category: 'Food', description: 'Restaurant dinner' },
  { amount: 8.75, category: 'Food', description: 'Breakfast sandwich' },
  { amount: 67.2, category: 'Food', description: 'Costco grocery run' },
  { amount: 22.4, category: 'Transportation', description: 'Uber ride' },
  { amount: 55.0, category: 'Transportation', description: 'Gas station fill-up' },
  { amount: 120.0, category: 'Transportation', description: 'Monthly bus pass' },
  { amount: 18.5, category: 'Transportation', description: 'Lyft to airport' },
  { amount: 45.0, category: 'Transportation', description: 'Car wash and detail' },
  { amount: 38.0, category: 'Entertainment', description: 'Movie tickets' },
  { amount: 14.99, category: 'Entertainment', description: 'Netflix subscription' },
  { amount: 9.99, category: 'Entertainment', description: 'Spotify premium' },
  { amount: 65.0, category: 'Entertainment', description: 'Concert tickets' },
  { amount: 25.0, category: 'Entertainment', description: 'Board game' },
  { amount: 150.0, category: 'Shopping', description: 'New sneakers' },
  { amount: 89.5, category: 'Shopping', description: 'Amazon order' },
  { amount: 45.0, category: 'Shopping', description: 'Clothing from Target' },
  { amount: 220.0, category: 'Shopping', description: 'Laptop accessories' },
  { amount: 35.0, category: 'Shopping', description: 'Books' },
  { amount: 1200.0, category: 'Bills', description: 'Monthly rent' },
  { amount: 95.0, category: 'Bills', description: 'Electric bill' },
  { amount: 75.0, category: 'Bills', description: 'Internet service' },
  { amount: 45.0, category: 'Bills', description: 'Water bill' },
  { amount: 180.0, category: 'Bills', description: 'Phone bill' },
  { amount: 30.0, category: 'Other', description: 'Haircut' },
  { amount: 50.0, category: 'Other', description: 'Gym membership' },
  { amount: 15.0, category: 'Other', description: 'Charity donation' },
  { amount: 80.0, category: 'Other', description: 'Medical copay' },
];

export function generateSampleData(): Expense[] {
  const now = new Date().toISOString();
  const expenses: Expense[] = [];

  // Spread over 90 days
  sampleExpenses.forEach((template, i) => {
    const daysAgo = Math.floor(Math.random() * 90);
    expenses.push({
      id: randomId(),
      date: randomDate(90, daysAgo),
      amount: template.amount,
      category: template.category,
      description: template.description,
      createdAt: now,
      updatedAt: now,
    });
  });

  return expenses.sort((a, b) => b.date.localeCompare(a.date));
}
