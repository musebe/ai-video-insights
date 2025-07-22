// components/layout/Sidebar.tsx

import { Button } from '@/components/ui/button';
import { SidebarNav } from './SidebarNav';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

// This can now be a Server Component because all client-side logic
// has been moved to SidebarNav.
export default function Sidebar() {
  // In a real app, you would fetch this data from your database.
  // We pass it as a prop to the client component.
  const videos = [
    { id: 'demo-video-1', title: 'First Demo Video' },
    { id: 'demo-video-2', title: 'Second Demo Video' },
  ];

  return (
    <aside className='hidden lg:flex lg:flex-col w-72 border-r bg-background'>
      <div className='p-4'>
        {/*
          Best Practice: Use the Button component with `asChild` to make a
          button that behaves like a Next.js Link. This is accessible and
          uses the correct semantics.
        */}
        <Button asChild className='w-full'>
          <Link href='/'>
            <PlusCircle className='mr-2 h-4 w-4' />
            Upload New Video
          </Link>
        </Button>
      </div>
      <div className='flex-1 overflow-y-auto'>
        <SidebarNav items={videos} />
      </div>
      <div className='p-4 border-t'>
        {/* Placeholder for footer content like user profile or settings */}
        <p className='text-sm text-muted-foreground'>User Settings</p>
      </div>
    </aside>
  );
}
