// app/layout.tsx
import '@/styles/globals.css';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import SettingsDrawer from '@/components/layout/SettingsDrawer';

const queryClient = new QueryClient();

export const metadata = {
  title: 'AI Video Insights',
  description: 'Upload, transcribe, and chat with your videos',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='flex h-screen bg-gray-50 dark:bg-gray-900'>
        <QueryClientProvider client={queryClient}>
          <Header />
          <div className='flex flex-1 overflow-hidden'>
            <Sidebar />
            <main className='flex-1 overflow-y-auto p-4'>{children}</main>
          </div>
          <SettingsDrawer />
          <Toaster />
        </QueryClientProvider>
      </body>
    </html>
  );
}
