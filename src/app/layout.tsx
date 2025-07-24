// app/layout.tsx

import './globals.css';
import { ReactNode } from 'react';
import Script from 'next/script';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SettingsPanel } from '@/components/layout/SettingsPanel';
import { Providers } from '@/components/Providers';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export const metadata = {
  title: 'AI Video Insights',
  description: 'Upload, transcribe, and chat with your videos',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className='dark'>
      <body className='bg-background text-foreground'>
        <Providers>
          <ResizablePanelGroup
            direction='horizontal'
            className='min-h-screen w-full'
          >
            {/* Panel 1: Sidebar */}
            <ResizablePanel
              defaultSize={20}
              maxSize={25}
              minSize={15}
              className='hidden lg:block'
            >
              <Sidebar />
            </ResizablePanel>
            <ResizableHandle withHandle className='hidden lg:flex' />

            {/* Panel 2: Main Content */}
            <ResizablePanel defaultSize={80}>
              <div className='flex flex-col h-full'>
                <Header />
                <main className='flex-1 overflow-hidden bg-muted/40'>
                  {children}
                </main>
              </div>
            </ResizablePanel>

            {/* Panel 3: Settings (Collapsible) */}
            <SettingsPanel />
          </ResizablePanelGroup>
        </Providers>

        {/* ADD THE CLOUDINARY WIDGET SCRIPT HERE */}
        <Script
          src='https://upload-widget.cloudinary.com/global/all.js'
          strategy='lazyOnload'
        />
      </body>
    </html>
  );
}
