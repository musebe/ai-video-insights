// app/video/[videoId]/page.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { InsightsPanel } from '@/components/insights/InsightsPanel';

// The props interface remains the same
interface VideoPageProps {
  params: {
    videoId: string;
  };
}

// THE FIX: Pass the entire `props` object and access `params` inside the function.
export default async function VideoPage(props: VideoPageProps) {
  // Access videoId directly from the props object.
  const videoId = props.params.videoId;

  // Fetch the specific video from our database using the ID from the URL.
  const video = await prisma.video.findUnique({
    where: {
      id: videoId,
    },
  });

  // If no video is found with that ID, show a standard 404 page.
  if (!video) {
    notFound();
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 h-full'>
      {/* Left Column: Video Player */}
      <div className='lg:col-span-3'>
        <VideoPlayer video={video} />
      </div>

      {/* Right Column: Insights and Chat Panel */}
      <div className='lg:col-span-2'>
        <InsightsPanel video={video} />
      </div>
    </div>
  );
}
