'use client';

import { useExpenses } from '@/context/ExpenseContext';
import Toast from './Toast';

export default function ToastContainer() {
  const { toast } = useExpenses();
  if (!toast) return null;
  return <Toast message={toast.message} type={toast.type} />;
}
