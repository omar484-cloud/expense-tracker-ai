---
title: Natural Language — Developer Reference
feature: natural-language
stack: frontend-only
created: 2026-04-25
updated: 2026-04-25
status: draft
---

# Natural Language — Developer Reference

> **Cross-reference:** End-user guide → [`docs/user/natural-language-guide.md`](../user/natural-language-guide.md)

## Overview

The Natural Language feature (branded "Spill") lets users add expenses by typing plain English instead of filling out a form. A custom regex-based parser extracts amount, category, date, and description from free-form text, shows a live preview, and stores the result to localStorage. No backend or AI library is involved — the entire pipeline runs client-side.

## Architecture

The pipeline is a one-way data flow: raw text → parser → ParseResult → AppContext → localStorage.

```
[NLInput textarea]
      │  onChange / onPaste
      ▼
[parser.ts] ──► parseExpense / parseMultiExpense / parseBatch
      │
      ▼  ParseResult[]
[ParsePreview] (render only)
      │
      ▼  onSubmit (Enter key)
[AppContext.addExpense / addExpenses]
      │
      ▼
[storage.ts → localStorage "spill:expenses"]
```

### Component Map

| Layer | File(s) | Responsibility |
|---|---|---|
| Input UI | `src/components/NLInput.tsx` | Textarea, keyboard handling, auto-resize, paste detection |
| Live Preview | `src/components/ParsePreview.tsx` | Renders ParseResult list with confidence dots and category picker |
| Parser | `src/lib/parser.ts` | Extracts amount, date, category, description from raw text |
| State | `src/context/AppContext.tsx` | Holds expenses array; exposes add/update/delete; persists to localStorage |
| Storage | `src/lib/storage.ts` | Thin localStorage wrapper (`spill:expenses`, `spill:budgets`) |
| Types | `src/types/expense.ts` | `Expense`, `ParseResult`, `Category`, `CATEGORY_META` constants |
| Page | `src/app/page.tsx` | Mounts `NLInput` and `ParsePreview` at the bottom of the feed |

## Frontend

### Components

| Component | Path | Description |
|---|---|---|
| `NLInput` | `src/components/NLInput.tsx` | Auto-resizing textarea that drives the full NL input flow |
| `ParsePreview` | `src/components/ParsePreview.tsx` | Real-time parse result display with interactive category override |

### State Management

State is handled via a single React Context (`AppContext`). No Redux or Zustand.

- `NLInput` reads `text` from local `useState`; calls `addExpense` / `addExpenses` from context on submit.
- `ParsePreview` is pure rendering — it receives `ParseResult[]` as a prop from `NLInput`.
- `AppContext` merges new expenses into the `expenses` array and calls `saveExpenses()` on every mutation.

### Routes / Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Only page; renders feed + NLInput + ParsePreview |

## API Reference

_Not applicable — this is a frontend-only feature with no API routes._

## Data Model

### `ParseResult` (transient — never persisted directly)

```typescript
interface ParseResult {
  amount: number | null;   // null means parser could not find a value
  description: string;
  category: Category;
  date: Date;
  confidence: 'high' | 'medium' | 'low';
  raw: string;             // original typed text
}
```

### `Expense` (persisted to localStorage)

```typescript
interface Expense {
  id: string;              // crypto.randomUUID()
  amount: number;
  description: string;
  category: Category;
  date: string;            // YYYY-MM-DD
  createdAt: string;       // ISO 8601 timestamp
  raw?: string;            // original typed text, preserved for auditing
}
```

### `Category`

```typescript
type Category = 'food' | 'transport' | 'entertainment' | 'shopping' | 'bills' | 'health' | 'other';
```

Each category has metadata in `CATEGORY_META`:

| Field | Type | Description |
|---|---|---|
| `label` | string | Display name |
| `color` | string | Tailwind color class |
| `emoji` | string | Emoji icon |
| `keywords` | string[] | Words that trigger auto-categorization |

### Storage Keys

| Key | Type | Description |
|---|---|---|
| `spill:expenses` | `Expense[]` JSON | All saved expenses |
| `spill:budgets` | `Record<Category, number>` JSON | Per-category monthly budgets |

## Configuration

_No environment variables or feature flags — the feature is always active._

| Variable | Required | Default | Description |
|---|---|---|---|
| — | — | — | No configuration needed |

## Dependencies

### Internal

| Module | Role |
|---|---|
| `src/context/AppContext.tsx` | Provides `addExpense` / `addExpenses` to NLInput |
| `src/types/expense.ts` | Shared types used by parser, context, and components |
| `src/lib/storage.ts` | Called by AppContext to persist results |

### External

| Dependency | Version | Purpose |
|---|---|---|
| `date-fns` | 3.3.1 | `startOfWeek`, `subDays`, `setDay` used in `parseDate()` |
| `react` | 18.2.0 | Hooks (`useState`, `useEffect`, `useRef`, `useCallback`) |
| `next` | 16.1.6 | App Router, client-side rendering |

> No AI or NLP libraries are used. The parser is fully custom regex-based.

## Error Handling

| Scenario | Behavior |
|---|---|
| No amount in input | `ParseResult.amount = null`; preview shows `$?`; submit is blocked |
| Unrecognized date expression | Defaults to today |
| Unrecognized category | Falls back to `'other'` |
| Batch line with no amount | Line is silently skipped |
| `"X and Y"` where only one side has an amount | Falls back to single-expense parse of the full string |
| localStorage unavailable (SSR) | `loadExpenses()` returns `[]`; save is a no-op |

No toast or alert is shown for parse failures — the live preview acts as implicit feedback (confidence dot + `$?` display).

## Security Considerations

- **No user authentication** — the app is fully local; there is no server to attack.
- **localStorage only** — data never leaves the browser.
- **No `eval` or dynamic code execution** — parser uses only `RegExp` and string operations.
- **XSS surface**: parsed `description` is rendered via React (auto-escaped). The `raw` field is stored but never rendered as HTML.

## Performance Notes

- Parsing runs synchronously on every keystroke via `useEffect`. For typical expense inputs (< 500 chars) this is imperceptible.
- Batch mode (`parseBatch`) iterates over newline-split lines; for large bank statement pastes (hundreds of lines) there is no debouncing — add one if users report lag.
- `saveExpenses` writes the entire expenses array to localStorage on every add/update/delete. For users with thousands of expenses this may become slow; consider batching or indexedDB migration.

## Testing

No test files exist in the codebase at this time.

```bash
# No test runner configured — add Jest or Vitest before writing tests
npm test   # currently: "Error: no test specified"
```

### Key Test Scenarios to Add

| Scenario | What to verify |
|---|---|
| `parseAmount("$45.99")` | Returns `45.99` |
| `parseAmount("45 dollars")` | Returns `45` |
| `parseAmount("coffee")` | Returns `null` |
| `parseDate("yesterday")` | Returns ISO string for D-1 |
| `parseDate("last monday")` | Returns most recent Monday |
| `inferCategory("starbucks")` | Returns `'food'` |
| `parseMultiExpense("coffee $4 and lunch $12")` | Returns two ParseResults |
| `parseBatch("12/15 STARBUCKS #1234 4.50\n1/3 UBER 9.00")` | Returns two ParseResults |
| Submit with `amount = null` | `addExpense` not called |
| Paste triggers batch mode | `parseBatch` called instead of `parseExpense` |

## Deployment Notes

_This feature is frontend-only and ships as part of the Next.js static bundle. No migration steps, feature flags, or infrastructure changes are needed._

- Run `npm run build` and verify no TypeScript errors in `parser.ts` or `NLInput.tsx`.
- The `nl-tracker` git branch contains this feature; it has not been merged to `main` as of 2026-04-25.

## Known Limitations & TODOs

- **No AI fallback**: Edge cases (unusual phrasing, foreign currency) silently fall back to `amount: null` with no suggestion.
- **English only**: `parseDate` and `inferCategory` keywords are hardcoded in English.
- **No undo**: Once submitted, the only way to fix a mis-parsed expense is to find and delete it from the feed.
- **No debounce on keystrokes**: Parsing fires on every character; add debounce if perf issues arise.
- **No tests**: The parser logic is untested; see Key Test Scenarios above.
- **`"X and Y"` limited to two items**: `parseMultiExpense` only splits on the first ` and `; `"coffee, lunch, and dinner"` is not handled.

## Related Documentation

- [`README.md`](../../README.md) — project setup, run commands, and feature overview
