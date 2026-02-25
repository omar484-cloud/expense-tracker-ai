# Spill 💸

> Just tell me what you spent.

A natural language expense tracker — **no forms, ever**. You describe expenses the way you'd tell a friend, and Spill figures out the rest.

---

## The Idea

Traditional expense trackers make you conform to *their* data model: pick a category, fill an amount field, choose a date. Spill flips this: you just *talk*, and the app listens.

```
"coffee $4.50 this morning"         → 🍕 Food  ·  $4.50  ·  today
"uber to the airport $28 last friday" → 🚗 Transport  ·  $28  ·  last Friday
"netflix 15.99 and spotify 9.99"    → 2 expenses detected
```

---

## Features

| Feature | Description |
|---------|-------------|
| **Natural language input** | Type expenses in plain English — no fields, no dropdowns |
| **Live parse preview** | See detected amount, category, and date as you type |
| **Category override** | Hover the category chip to pick a different one before adding |
| **Inline editing** | Click any expense card to edit any field in place |
| **Batch import** | Paste a bank statement (multi-line) for instant bulk import |
| **"X and Y" split** | `"coffee $4 and lunch $12"` creates two expenses at once |
| **Budget health rings** | Animated circular progress rings per category; turn amber/red as budgets fill |
| **Editable budgets** | Click the dollar amount on any ring to update the monthly budget |
| **Spending persona** | A witty character that updates as your spending pattern emerges |
| **Month navigation** | Browse historical months via the header arrows |
| **localStorage** | All data stays in your browser — no backend, no account |

---

## Getting Started

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## How to Use

### Single expense
Type anything into the input bar and press **Enter**:
```
coffee $4.50 this morning
rent 1500 yesterday
uber to work $18.50 last monday
```

### Multiple at once ("and" split)
```
coffee $4 and lunch $12
```

### Batch import (paste a bank statement)
Paste multiple lines (Shift+Enter to add newlines, then Enter to import all):
```
12/15  STARBUCKS #1234        4.50
12/15  UBER *TRIP             18.23
12/16  WHOLE FOODS MKT        67.45
12/17  NETFLIX.COM            15.99
```

### Edit an expense
Click any card in the feed. Fields appear inline — change amount, description, category, or date, then Save.

### Edit a budget
In the left sidebar, click the dollar amount below any category ring. Type a new budget and press Enter.

---

## Date expressions understood

| You type | Means |
|----------|-------|
| `today`, `this morning`, `tonight` | Today |
| `yesterday` | Yesterday |
| `monday`, `tuesday`, … | Most recent occurrence |
| `last monday` | The Monday before that |
| `3 days ago` | 3 days back |
| `jan 5`, `january 5th` | Jan 5 of the current or prior year |
| `1/5`, `12/25` | M/D shorthand |

---

## Stack

- **Next.js 16** (App Router, single-page)
- **TypeScript** (strict)
- **Tailwind CSS** (dark theme)
- **localStorage** (zero backend)
- Custom SVG charts — no charting library needed
