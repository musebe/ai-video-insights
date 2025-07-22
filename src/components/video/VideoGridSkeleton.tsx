// components/video/VideoGridSkeleton.tsx

import { Skeleton } from '@/components/ui/skeleton';

export function VideoGridSkeleton() {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className='space-y-2'>
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='aspect-video w-full' />
        </div>
      ))}
    </div>
  );
}
