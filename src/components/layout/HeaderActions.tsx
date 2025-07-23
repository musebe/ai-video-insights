// /components/layout/HeaderActions.tsx

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search, Video, Settings, User } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { useUIStore } from '@/lib/use-ui-store';
import type { Folder, Video as VideoType } from '@prisma/client';

// This is the specific type that SidebarNav expects
type FolderWithVideos = Folder & {
  videos: Pick<VideoType, 'id' | 'title'>[];
};

interface HeaderActionsProps {
  foldersWithVideos: FolderWithVideos[];
}

export function HeaderActions({ foldersWithVideos }: HeaderActionsProps) {
  const openSettings = useUIStore((s) => s.openSettings);

  return (
    <>
      {/* Mobile Menu (Sheet) */}
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
          {/* This now receives the correct, real data */}
          <SidebarNav items={foldersWithVideos} />
        </SheetContent>
      </Sheet>

      {/* Search Bar */}
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

      {/* Settings and User Buttons */}
      <Button variant='ghost' size='icon' onClick={openSettings}>
        <Settings className='h-5 w-5' />
        <span className='sr-only'>Settings</span>
      </Button>
      <Button variant='ghost' size='icon'>
        <User className='h-5 w-5' />
        <span className='sr-only'>Profile</span>
      </Button>
    </>
  );
}
