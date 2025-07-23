// components/layout/Sidebar.tsx

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './SidebarNav';
import { PlusCircle, Video } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { CreateFolderDialog } from './CreateFolderDialog';

// This is now an async Server Component, allowing us to fetch data directly.
export async function Sidebar() {
  // Fetch all folders and their related videos in a single, efficient query.
  const foldersWithVideos = await prisma.folder.findMany({
    include: {
      videos: {
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <aside className='hidden border-r bg-background lg:block'>
      <div className='flex h-full max-h-screen flex-col gap-2'>
        <div className='flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6'>
          <Link href='/' className='flex items-center gap-2 font-semibold'>
            <Video className='h-6 w-6' />
            <span>AI Video Insights</span>
          </Link>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <nav className='grid items-start gap-4 p-4'>
            <Button asChild>
              <Link href='/'>
                <PlusCircle className='mr-2 h-4 w-4' />
                Upload New Video
              </Link>
            </Button>
            <CreateFolderDialog />
            {/* Pass the fetched data to the client component for rendering */}
            <SidebarNav items={foldersWithVideos} />
          </nav>
        </div>
        <div className='mt-auto p-4 border-t'>
          <p className='text-sm text-muted-foreground'>user@example.com</p>
        </div>
      </div>
    </aside>
  );
}
