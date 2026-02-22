'use client';

import { useState } from 'react';
import { PlusCircle, Inbox, Database } from 'lucide-react';
import { useExpenses } from '@/context/ExpenseContext';
import ExpenseRow from './ExpenseRow';
import Modal from './Modal';
import ExpenseForm from './ExpenseForm';

const PAGE_SIZE = 15;

interface ExpenseListProps {
  showAddButton?: boolean;
  limitRows?: number;
}

export default function ExpenseList({ showAddButton = true, limitRows }: ExpenseListProps) {
  const { filteredExpenses, expenses, loadSampleData } = useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);

  const displayed = limitRows ? filteredExpenses.slice(0, limitRows) : filteredExpenses;
  const paginated = limitRows ? displayed : displayed.slice(0, page * PAGE_SIZE);
  const hasMore = !limitRows && paginated.length < filteredExpenses.length;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            {limitRows ? 'Recent Expenses' : 'All Expenses'}
          </h3>
          {showAddButton && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <PlusCircle size={13} />
              Add Expense
            </button>
          )}
        </div>

        {/* List */}
        {paginated.length > 0 ? (
          <>
            <div>
              {paginated.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </div>
            {hasMore && (
              <div className="px-5 py-3 border-t border-slate-100">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="w-full py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                >
                  Load more ({filteredExpenses.length - paginated.length} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            {expenses.length === 0 ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Database size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium mb-1">No expenses yet</p>
                <p className="text-sm text-slate-500 mb-5">
                  Add your first expense or load sample data to get started.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={loadSampleData}
                    className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                  >
                    Load Sample Data
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Inbox size={28} className="text-slate-400" />
                </div>
                <p className="text-slate-900 font-medium mb-1">No expenses match your filters</p>
                <p className="text-sm text-slate-500">Try adjusting your search or filters.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </>
  );
}
