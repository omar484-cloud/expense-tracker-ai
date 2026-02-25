'use client';

import { useState } from 'react';
import { PlusCircle, Sparkles, Trash2, Download } from 'lucide-react';
import SummaryCards from '@/components/SummaryCards';
import CategoryChart from '@/components/CategoryChart';
import MonthlyChart from '@/components/MonthlyChart';
import ExpenseList from '@/components/ExpenseList';
import Modal from '@/components/Modal';
import ExpenseForm from '@/components/ExpenseForm';
import ExportDrawer from '@/components/ExportDrawer';
import { useExpenses } from '@/context/ExpenseContext';

export default function DashboardPage() {
  const { expenses, loadSampleData, clearAllData, isLoaded } = useExpenses();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExport, setShowExport] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {expenses.length === 0 ? (
            <button
              onClick={loadSampleData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors shadow-sm"
            >
              <Sparkles size={15} className="text-amber-500" />
              Load Sample Data
            </button>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-500 text-sm font-medium transition-colors shadow-sm"
            >
              <Trash2 size={14} />
              Clear Data
            </button>
          )}
          {expenses.length > 0 && (
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 text-sm font-medium transition-colors shadow-sm group"
            >
              <Download size={15} className="group-hover:text-indigo-600 transition-colors" />
              Export
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm shadow-indigo-200"
          >
            <PlusCircle size={15} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary cards */}
      {isLoaded && <SummaryCards />}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CategoryChart />
        <MonthlyChart />
      </div>

      {/* Recent expenses */}
      <ExpenseList limitRows={8} showAddButton={false} />

      {/* Add Expense Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expense">
        <ExpenseForm onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Export Drawer */}
      <ExportDrawer isOpen={showExport} onClose={() => setShowExport(false)} />

      {/* Clear confirmation */}
      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear All Data"
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-5">
          <p className="text-sm text-slate-700">
            This will permanently delete all{' '}
            <span className="font-semibold">{expenses.length} expenses</span>. This action cannot
            be undone.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => setShowClearConfirm(false)}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearAllData();
              setShowClearConfirm(false);
            }}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors"
          >
            Clear All
          </button>
        </div>
      </Modal>
    </div>
  );
}
