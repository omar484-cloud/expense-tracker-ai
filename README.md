# ExpenseTracker AI

A modern, full-featured personal finance tracker built with Next.js 16, TypeScript, and Tailwind CSS. Track expenses, visualize spending patterns, and export your data — all stored locally in your browser.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm v9 or later

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

### 3. Open the app

Navigate to **http://localhost:3000** in your browser.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Testing All Features

### Dashboard (`/`)

1. **Load sample data** — Click **"Load Sample Data"** on the dashboard to populate 32 realistic expenses spread across the last 3 months. This lets you immediately explore all features without manually entering data.

2. **Summary cards** — Review the 4 stat cards at the top:
   - *Total Spent* — all-time total across all expenses
   - *This Month* — current month total with a % change badge vs last month
   - *Avg / Day* — average daily spend for the current month
   - *Top Category* — highest-spend category this month

3. **Spending by Category chart** — Donut chart showing proportional spend per category with a legend. Hover slices to highlight them.

4. **Monthly Spending chart** — Bar chart of the last 6 months. Hover bars to see exact totals. The current month is highlighted in indigo.

5. **Recent Expenses list** — Shows the 8 most recent expenses. Hover any row to reveal **Edit** (pencil) and **Delete** (trash) action buttons.

6. **Add an expense** — Click **"Add Expense"** (top-right). Fill in:
   - *Date* — defaults to today; cannot be set in the future
   - *Amount* — enter a number (e.g. `24.99`); the `$` prefix is automatic
   - *Category* — click one of the 6 category tiles (Food, Transportation, Entertainment, Shopping, Bills, Other)
   - *Description* — optional, max 200 characters
   - Submit with **"Add Expense"** or cancel with **"Cancel"**. Try submitting with empty fields to see validation errors.

7. **Edit an expense** — Hover a row on the dashboard or expenses page → click the pencil icon → modify fields → click **"Save Changes"**.

8. **Delete an expense** — Hover a row → click the trash icon → confirm in the dialog.

9. **Clear all data** — Click **"Clear Data"** (top-right on dashboard) → confirm to wipe everything.

---

### Expenses Page (`/expenses`)

Navigate to **Expenses** in the sidebar (desktop) or bottom nav (mobile).

1. **Search** — Type in the search box to instantly filter by description or category name.

2. **Date presets** — Click any preset pill to filter by time range:
   - *All Time*, *This Month*, *Last Month*, *Last 3 Months*, *This Year*
   - *Custom* — reveals two date pickers (From / To) for a precise range

3. **Category filter** — Click any category chip (Food, Transportation, etc.) to show only that category. Click **"All Categories"** to reset.

4. **Sort** — Use the sort dropdown (top-right of the search row) to sort by:
   - Date (Newest / Oldest)
   - Amount (High to Low / Low to High)
   - Category A–Z

5. **Results count** — The label below the filters shows how many expenses match the current filters.

6. **Clear filters** — If any filter is active, a **"Clear filters"** link appears to reset everything at once.

7. **Pagination** — The list shows 15 expenses at a time. Click **"Load more"** at the bottom to fetch the next batch.

8. **Export to CSV** — Click **"Export CSV"** (top-right). The download will contain only the currently filtered expenses. The filename includes today's date (e.g. `expenses-2026-02-21.csv`). Try exporting with a category filter active to get a category-specific report.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout (Navigation + ExpenseProvider)
│   ├── page.tsx             # Dashboard page
│   ├── globals.css          # Tailwind base + custom styles
│   └── expenses/
│       └── page.tsx         # Expenses list page
├── components/
│   ├── Navigation.tsx       # Sidebar (desktop) + top/bottom nav (mobile)
│   ├── SummaryCards.tsx     # Stats cards row
│   ├── CategoryChart.tsx    # SVG donut chart
│   ├── MonthlyChart.tsx     # SVG bar chart
│   ├── ExpenseList.tsx      # Paginated expense list container
│   ├── ExpenseRow.tsx       # Single expense row with edit/delete
│   ├── ExpenseForm.tsx      # Add/edit form with validation
│   ├── FilterBar.tsx        # Search, presets, category, sort controls
│   ├── Modal.tsx            # Reusable modal dialog
│   ├── Toast.tsx            # Toast notification UI
│   └── ToastContainer.tsx   # Reads toast state from context
├── context/
│   └── ExpenseContext.tsx   # Global state, CRUD operations, filtering logic
├── types/
│   └── expense.ts           # TypeScript types and category constants
└── utils/
    ├── storage.ts           # localStorage read/write
    ├── formatters.ts        # Currency, date, and input formatting
    ├── calculations.ts      # Analytics (stats, category breakdown, monthly totals)
    ├── export.ts            # CSV export
    └── sampleData.ts        # Sample expense generator
```

---

## Data Persistence

All expenses are saved to **localStorage** under the key `expense-tracker-data`. Data persists across page refreshes and browser sessions. Clearing browser storage or clicking "Clear Data" will remove all expenses.

---

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** — App Router, React Server/Client Components
- **[TypeScript](https://www.typescriptlang.org/)** — strict mode
- **[Tailwind CSS 3](https://tailwindcss.com/)** — utility-first styling
- **[lucide-react](https://lucide.dev/)** — icons
- **[date-fns](https://date-fns.org/)** — date utilities
