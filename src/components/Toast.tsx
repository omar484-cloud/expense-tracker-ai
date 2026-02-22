'use client';

import { CheckCircle, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: ToastProps) {
  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
          type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
        ) : (
          <XCircle size={16} className="text-rose-600 shrink-0" />
        )}
        {message}
      </div>
    </div>
  );
}
