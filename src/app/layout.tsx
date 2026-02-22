import type { Metadata } from 'next';
import './globals.css';
import { ExpenseProvider } from '@/context/ExpenseContext';
import Navigation from '@/components/Navigation';
import ToastContainer from '@/components/ToastContainer';

export const metadata: Metadata = {
  title: 'ExpenseTracker — Personal Finance',
  description: 'Track your personal expenses with ease',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ExpenseProvider>
          <Navigation />
          {/* Main content — offset for sidebar on desktop, top/bottom bars on mobile */}
          <main className="md:ml-60 pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
              {children}
            </div>
          </main>
          <ToastContainer />
        </ExpenseProvider>
      </body>
    </html>
  );
}
