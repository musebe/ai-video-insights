// components/layout/SidebarNav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Folder, ChevronsUpDown } from 'lucide-react';
import type { Folder as FolderType, Video as VideoType } from '@prisma/client';

// Define a more specific type for the props we receive from the server
type FolderWithVideos = FolderType & {
  videos: Pick<VideoType, 'id' | 'title'>[];
};

interface SidebarNavProps {
  items: FolderWithVideos[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();

  if (!items?.length) {
    return (
      <p className='p-4 text-sm text-center text-muted-foreground'>
        No folders created yet.
      </p>
    );
  }

  return (
    <div className='w-full space-y-2'>
      {items.map((folder) => (
        <Collapsible key={folder.id} defaultOpen={true}>
          <CollapsibleTrigger asChild>
            <Button variant='ghost' className='w-full justify-between'>
              <div className='flex items-center gap-2'>
                <Folder className='h-4 w-4' />
                <span className='font-semibold'>{folder.name}</span>
              </div>
              <ChevronsUpDown className='h-4 w-4' />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='py-1 pl-6 space-y-1'>
            {folder.videos.length > 0 ? (
              folder.videos.map((video) => {
                const href = `/video/${video.id}`;
                const isActive = pathname === href;
                return (
                  <Link key={video.id} href={href} legacyBehavior={false}>
                    <Button
                      variant='ghost'
                      className={cn(
                        'w-full justify-start',
                        isActive && 'bg-secondary hover:bg-secondary'
                      )}
                    >
                      {video.title}
                    </Button>
                  </Link>
                );
              })
            ) : (
              <p className='text-xs text-muted-foreground px-4 py-2'>
                No videos in this folder.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}
