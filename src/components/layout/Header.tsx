// components/layout/Header.tsx

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Video, Settings, User } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { useUIStore } from '@/lib/use-ui-store';

export function Header() {
  // Only need the `openSettings` action from the store now
  const openSettings = useUIStore((s) => s.openSettings);

  const videos = [
    { id: 'demo-video-1', title: 'First Demo Video' },
    { id: 'demo-video-2', title: 'Second Demo Video' },
  ];

  return (
    <header className='flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30'>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className='shrink-0 lg:hidden'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='flex flex-col'>
          <Link
            href='/'
            className='flex items-center gap-2 text-lg font-semibold mb-4'
          >
            <Video className='h-6 w-6' />
            <span>AI Video Insights</span>
          </Link>
          <SidebarNav items={videos} />
        </SheetContent>
      </Sheet>

      <div className='w-full flex-1'>
        <form>
          <div className='relative'>
            <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search videos...'
              className='w-full appearance-none bg-muted pl-8 shadow-none md:w-2/3 lg:w-1/3'
            />
          </div>
        </form>
      </div>

      {/* This button now just opens the panel */}
      <Button variant='ghost' size='icon' onClick={openSettings}>
        <Settings className='h-5 w-5' />
        <span className='sr-only'>Settings</span>
      </Button>
      <Button variant='ghost' size='icon'>
        <User className='h-5 w-5' />
        <span className='sr-only'>Profile</span>
      </Button>
    </header>
  );
}
