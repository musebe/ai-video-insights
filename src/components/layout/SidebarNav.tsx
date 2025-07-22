// components/layout/SidebarNav.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- The correct hook for path
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // <-- Shadcn's utility for conditional classes

interface SidebarNavProps {
  items: {
    id: string;
    title: string;
  }[];
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname(); // <-- Gets the current path, e.g., "/demo-video-1"

  if (!items?.length) {
    return (
      <p className='p-4 text-sm text-muted-foreground'>No videos found.</p>
    );
  }

  return (
    <nav className='grid items-start gap-2 p-4'>
      {items.map((item) => {
        const href = `/${item.id}`;
        const isActive = pathname === href;

        return (
          <Link key={item.id} href={href}>
            {/*
              Best Practice: Use the Button component with a "ghost" variant
              to create the nav links. It handles focus, hover, and active
              states beautifully. We use `cn` to conditionally apply the
              "secondary" background color for the active link.
            */}
            <Button
              variant='ghost'
              className={cn(
                'w-full justify-start',
                isActive && 'bg-secondary hover:bg-secondary'
              )}
            >
              {item.title}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
