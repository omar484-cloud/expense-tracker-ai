'use client';

import { useState } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Expense, CATEGORY_BADGE_CLASSES, CATEGORY_ICONS } from '@/types/expense';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Modal from './Modal';
import ExpenseForm from './ExpenseForm';

interface ExpenseRowProps {
  expense: Expense;
}

export default function ExpenseRow({ expense }: ExpenseRowProps) {
  const { deleteExpense } = useExpenses();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="group flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
        {/* Category icon */}
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 shrink-0 text-xl">
          {CATEGORY_ICONS[expense.category]}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {expense.description || expense.category}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">{formatDate(expense.date)}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ring-1 ${CATEGORY_BADGE_CLASSES[expense.category]}`}
                >
                  {expense.category}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-base font-bold text-slate-900">
                {formatCurrency(expense.amount)}
              </span>
              {/* Actions — visible on hover or focus */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowEdit(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  aria-label="Edit expense"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setShowDelete(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Delete expense"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Expense">
        <ExpenseForm editing={expense} onClose={() => setShowEdit(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Expense" maxWidth="max-w-sm">
        <div className="px-6 py-5">
          <p className="text-sm text-slate-700 mb-1">
            Are you sure you want to delete this expense?
          </p>
          <div className="mt-3 p-3 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-900">{expense.description || expense.category}</p>
            <p className="text-sm text-slate-500 mt-0.5">
              {formatCurrency(expense.amount)} · {formatDate(expense.date)}
            </p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteExpense(expense.id);
              setShowDelete(false);
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-sm font-semibold text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
}
