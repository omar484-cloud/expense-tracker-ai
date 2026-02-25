'use client';

import { useState } from 'react';
import { PlusCircle, Download } from 'lucide-react';
import FilterBar from '@/components/FilterBar';
import ExpenseList from '@/components/ExpenseList';
import Modal from '@/components/Modal';
import ExpenseForm from '@/components/ExpenseForm';
import ExportDrawer from '@/components/ExportDrawer';
import { useExpenses } from '@/context/ExpenseContext';
import { formatCurrency } from '@/utils/formatters';

export default function ExpensesPage() {
  const { filteredExpenses } = useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const total = filteredExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Total shown:{' '}
            <span className="font-semibold text-slate-700">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExport(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 text-sm font-medium transition-colors shadow-sm group"
          >
            <Download size={15} className="group-hover:text-indigo-600 transition-colors" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
          >
            <PlusCircle size={15} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <FilterBar />
      </div>

      {/* Expense list */}
      <ExpenseList showAddButton={false} />

      {/* Add Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Export Drawer */}
      <ExportDrawer isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}
