---
title: How to Use Natural Language
feature: natural-language
audience: end-users
created: 2026-04-25
updated: 2026-04-25
---

# How to Use Natural Language

> **For developers:** See the [technical implementation guide](../dev/natural-language-implementation.md).

## What Is This Feature?

Instead of filling out a form, you can just *describe* what you spent in plain English and Spill figures out the rest — amount, category, and date — automatically. It's the fastest way to log an expense.

## Before You Start

- [ ] Open Spill at `http://localhost:3000` (or your hosted URL)
- [ ] No account or login needed — everything is saved in your browser

---

## Step-by-Step Guide

### Step 1 — Type your expense in the text box

![Step 1: The natural language input box at the bottom of the screen](./screenshots/natural-language/step-01.png)
> _Screenshot: A large text box at the bottom of the page with placeholder text like "spill it… coffee $4.50 this morning"_

Click the text box at the bottom of the screen and type what you spent. You don't need any special format — just describe it naturally:

- `coffee $4.50`
- `grabbed lunch for $12 yesterday`
- `uber to work this morning, $9`
- `paid netflix $15.99`

---

### Step 2 — Watch the live preview update as you type

![Step 2: A preview card showing the parsed amount, category, date and description](./screenshots/natural-language/step-02.png)
> _Screenshot: A preview area above the input showing "$4.50 · Food · Today · coffee" with a green confidence dot_

As you type, a preview card appears showing what Spill detected:

- **Amount** — the dollar value it found
- **Category** — auto-detected from keywords (e.g., "uber" → Transport, "netflix" → Entertainment)
- **Date** — today by default, or whatever date you mentioned
- **Confidence dot** — green means it's sure, amber means it guessed, gray means it's unsure

If the amount shows as **`$?`**, Spill couldn't find a number — try adding it (e.g., `coffee $4`).

---

### Step 3 — Override the category if needed

![Step 3: Hovering the category chip opens a dropdown to pick a different category](./screenshots/natural-language/step-03.png)
> _Screenshot: The category chip (e.g., "Food") is highlighted and a dropdown menu with all 7 categories is open_

Hover over the category chip in the preview card. A dropdown appears letting you pick a different category before saving.

---

### Step 4 — Press Enter to save

![Step 4: Pressing Enter clears the input and the new expense appears in the feed](./screenshots/natural-language/step-04.png)
> _Screenshot: The input box is empty and the newly added expense now appears at the top of the expense feed_

Press **Enter** to save the expense. The input clears, the preview disappears, and your expense appears at the top of the feed instantly.

> Tip: Press **Shift+Enter** to add a line break if you want to log multiple expenses at once (see below).

---

### Step 5 — Log multiple expenses at once

![Step 5: Multiple lines of expenses in the input box showing a list preview](./screenshots/natural-language/step-05.png)
> _Screenshot: Three lines of text in the input box; the preview shows a list of three parsed expenses with amounts and categories_

You can log several expenses in one go two ways:

**"X and Y" on a single line:**
```
coffee $4 and lunch $12
```

**Multiple lines (Shift+Enter between each):**
```
coffee $4 this morning
lunch $12
uber $9 yesterday
```

Press **Enter** when done — all valid lines are saved together.

---

### Step 6 — Paste a bank statement

![Step 6: A multi-line bank statement pasted into the input box with a batch preview list](./screenshots/natural-language/step-06.png)
> _Screenshot: Many lines of bank statement data in the input; a preview list shows each transaction with its detected category_

Copy rows from your online banking export and paste them directly into the input. Spill recognizes common bank statement formats:

```
12/15 STARBUCKS #1234        4.50
12/14 UBER *TRIP             9.00
12/13 NETFLIX.COM           15.99
```

Review the preview list, then press **Enter** to import all valid rows.

---

## What Happens Next

After pressing Enter, your expense(s) appear at the top of the feed with the correct amount, category, and date. The summary cards at the top of the page update immediately to reflect your new total. Everything is saved in your browser automatically — no account needed.

---

## Frequently Asked Questions

**Q: What if Spill guesses the wrong category?**
A: Hover over the category chip in the preview before pressing Enter — a dropdown lets you change it. If you've already saved it, find the expense in your feed, click the edit icon, and update the category there.

**Q: What date formats can I use?**
A: Spill understands natural expressions like `today`, `yesterday`, `this morning`, `last monday`, `3 days ago`, and written dates like `jan 5` or `1/5/25`. If you don't mention a date, it defaults to today.

**Q: Can I log expenses without a dollar amount?**
A: You can type without one, but Spill won't save it — the preview shows `$?` and pressing Enter does nothing. Add the amount to your description (e.g., `coffee $4`) and it will save correctly.

**Q: Where is my data stored?**
A: Everything is stored locally in your browser (localStorage). It never leaves your device and no account is required. Clearing your browser data will delete your expenses.

---

## Troubleshooting

| Error / Message | What It Means | What To Do |
|---|---|---|
| Preview shows `$?` | Spill couldn't find a dollar amount in your text | Add the amount — e.g., change `"coffee this morning"` to `"coffee $4 this morning"` |
| Preview shows a gray dot | Low confidence — Spill found an amount but isn't sure about the rest | Check that the preview looks right before pressing Enter; adjust category if needed |
| Pressing Enter does nothing | All detected items have `amount = null` | Make sure at least one line has a clear dollar value |
| Bank statement not parsing | The format isn't recognized | Try copying fewer rows, or enter expenses one at a time |
| Expense saved with wrong date | Date expression wasn't recognized | Edit the expense in the feed, or add a clearer date next time (e.g., `jan 5` instead of `5th`) |
| Data disappeared after clearing browser | localStorage was cleared | Your data is browser-local — export regularly if you need a backup |

---

## Related Guides

- [`README.md`](../../README.md) — getting started and running the app locally

---
_Have feedback on this guide? Contact the team at omar_m65@hotmail.com_
