// app/video/[videoId]/page.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { InsightsPanel } from '@/components/insights/InsightsPanel';

export default async function VideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  // Wait on the params promise to extract the dynamic segment
  const { videoId } = await params;

  // Fetch the video record from your database
  const video = await prisma.video.findUnique({
    where: { id: videoId },
  });

  // If no matching video, render the Next.js 404 page
  if (!video) {
    notFound();
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 h-full p-4 md:p-8'>
      {/* Left Column: Video Player */}
      <div className='lg:col-span-3'>
        <VideoPlayer video={video} />
      </div>

      {/* Right Column: Insights Panel */}
      <div className='lg:col-span-2'>
        <InsightsPanel video={video} />
      </div>
    </div>
  );
}
