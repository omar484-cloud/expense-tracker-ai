'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import BudgetPanel from '@/components/BudgetPanel';
import ExpenseFeed from '@/components/ExpenseFeed';
import NLInput from '@/components/NLInput';

export default function SpillPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    const isNow = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isNow) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}
    >
      {/* Header */}
      <Header year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />

      {/* Body: sidebar + feed */}
      <div className="flex flex-1 overflow-hidden">
        {/* Budget sidebar — hidden on small screens */}
        <div className="hidden md:flex">
          <BudgetPanel year={year} month={month} />
        </div>

        {/* Expense feed */}
        <div className="flex flex-col flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
          <ExpenseFeed />
        </div>
      </div>

      {/* NL Input bar */}
      <NLInput />
    </div>
  );
}
