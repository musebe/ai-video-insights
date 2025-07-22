// components/layout/Header.tsx
'use client';

import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { useUIStore } from '@/lib/use-ui-store';

export default function Header() {
  const openSettings = useUIStore((s) => s.openSettings);

  return (
    <header className='flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 shadow'>
      <h1 className='text-xl font-semibold'>AI Video Insights</h1>
      <Button variant='outline' size='sm' onClick={openSettings}>
        <Settings className='mr-2 h-4 w-4' /> Settings
      </Button>
    </header>
  );
}
