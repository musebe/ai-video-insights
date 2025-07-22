// components/layout/Sidebar.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './SidebarNav';
import { PlusCircle, Video } from 'lucide-react';

export function Sidebar() {
  // In a real app, you would fetch this from your database.
  const videos = [
    { id: 'demo-video-1', title: 'First Demo Video' },
    { id: 'demo-video-2', title: 'Second Demo Video' },
  ];

  return (
    // This sidebar is hidden on screens smaller than `lg`
    <aside className='hidden border-r bg-background lg:block'>
      <div className='flex h-full max-h-screen flex-col gap-2'>
        <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <Video className='h-6 w-6' />
            <span>AI Video Insights</span>
          </Link>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <nav className='grid items-start gap-2 p-4'>
            <Button asChild>
              <Link href='/'>
                <PlusCircle className='mr-2 h-4 w-4' />
                Upload New Video
              </Link>
            </Button>
            <SidebarNav items={videos} />
          </nav>
        </div>
        <div className='mt-auto p-4 border-t'>
          {/* Placeholder for user info */}
          <p className='text-sm text-muted-foreground'>user@example.com</p>
        </div>
      </div>
    </aside>
  );
}
