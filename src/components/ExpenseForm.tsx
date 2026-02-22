'use client';

import { useState, useEffect, FormEvent } from 'react';
import { DollarSign, Calendar, Tag, FileText, AlertCircle } from 'lucide-react';
import { Expense, CATEGORIES, Category, CATEGORY_ICONS } from '@/types/expense';
import { useExpenses } from '@/context/ExpenseContext';
import { getTodayString, formatAmountInput } from '@/utils/formatters';

interface ExpenseFormProps {
  editing?: Expense | null;
  onClose: () => void;
}

interface FormErrors {
  date?: string;
  amount?: string;
  category?: string;
  description?: string;
}

const EMPTY_FORM = {
  date: '',
  amount: '',
  category: '' as Category | '',
  description: '',
};

export default function ExpenseForm({ editing, onClose }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useExpenses();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setForm({
        date: editing.date,
        amount: String(editing.amount),
        category: editing.category,
        description: editing.description,
      });
    } else {
      setForm({ ...EMPTY_FORM, date: getTodayString() });
    }
    setErrors({});
  }, [editing]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.date) errs.date = 'Date is required';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (parseFloat(form.amount) > 1_000_000) errs.amount = 'Amount is too large';
    if (!form.category) errs.category = 'Select a category';
    if (form.description.length > 200) errs.description = 'Max 200 characters';
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const payload = {
      date: form.date,
      amount: parseFloat(parseFloat(form.amount).toFixed(2)),
      category: form.category as Category,
      description: form.description.trim(),
    };

    if (editing) {
      updateExpense(editing.id, payload);
    } else {
      addExpense(payload);
    }

    onClose();
    setIsSubmitting(false);
  }

  const inputBase =
    'w-full rounded-xl border px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500';
  const inputDefault = 'border-slate-200 bg-white hover:border-slate-300';
  const inputError = 'border-rose-300 bg-rose-50 focus:ring-rose-400 focus:border-rose-400';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="px-6 py-5 space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              Date
            </span>
          </label>
          <input
            type="date"
            value={form.date}
            max={getTodayString()}
            onChange={(e) => {
              setForm((f) => ({ ...f, date: e.target.value }));
              setErrors((err) => ({ ...err, date: undefined }));
            }}
            className={`${inputBase} ${errors.date ? inputError : inputDefault}`}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.date}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-slate-400" />
              Amount
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => {
                setForm((f) => ({ ...f, amount: formatAmountInput(e.target.value) }));
                setErrors((err) => ({ ...err, amount: undefined }));
              }}
              className={`${inputBase} pl-8 ${errors.amount ? inputError : inputDefault}`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.amount}
            </p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Tag size={14} className="text-slate-400" />
              Category
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setForm((f) => ({ ...f, category: cat }));
                  setErrors((err) => ({ ...err, category: undefined }));
                }}
                className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-medium transition-all ${
                  form.category === cat
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={11} /> {errors.category}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="flex items-center gap-1.5">
              <FileText size={14} className="text-slate-400" />
              Description{' '}
              <span className="text-slate-400 font-normal">(optional)</span>
            </span>
          </label>
          <textarea
            rows={2}
            placeholder="What was this for?"
            value={form.description}
            onChange={(e) => {
              setForm((f) => ({ ...f, description: e.target.value }));
              setErrors((err) => ({ ...err, description: undefined }));
            }}
            className={`${inputBase} resize-none ${errors.description ? inputError : inputDefault}`}
          />
          <div className="flex items-center justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={11} /> {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span className={`text-xs ml-auto ${form.description.length > 180 ? 'text-amber-500' : 'text-slate-400'}`}>
              {form.description.length}/200
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-colors disabled:opacity-60"
        >
          {editing ? 'Save Changes' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
}
