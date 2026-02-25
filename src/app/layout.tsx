import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Spill — Just tell me what you spent',
  description: 'A natural language expense tracker. No forms, ever.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ height: '100vh', overflow: 'hidden' }}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
