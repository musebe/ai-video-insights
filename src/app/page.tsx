// app/page.tsx

import { VideoUploadArea } from '@/components/video/VideoUploadArea';
import { VideoGrid } from '@/components/video/VideoGrid';
import { Suspense } from 'react';
import { VideoGridSkeleton } from '@/components/video/VideoGridSkeleton';

export default function HomePage() {
  return (
    <div className='space-y-8'>
      {/* Component for handling video uploads */}
      <VideoUploadArea />

      {/*
        Best Practice: Use React Suspense to handle the loading state.
        This allows the rest of the page to be interactive while data is
        being fetched, and it's the modern way to handle loading in Next.js.
      */}
      <Suspense fallback={<VideoGridSkeleton />}>
        {/* Component for displaying the list of videos */}
        <VideoGrid />
      </Suspense>
    </div>
  );
}
