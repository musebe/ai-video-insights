// app/video/[videoId]/page.tsx

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { InsightsPanel } from '@/components/insights/InsightsPanel';

export default async function VideoPage({
  params, // ← Next will give you this
}: {
  params: { videoId: string };
}) {
  const { videoId } = params;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
  });

  if (!video) notFound();

  return (
    <div className='grid grid-cols-1 lg:grid-cols-5 gap-8 h-full'>
      <div className='lg:col-span-3'>
        <VideoPlayer video={video} />
      </div>
      <div className='lg:col-span-2'>
        <InsightsPanel video={video} />
      </div>
    </div>
  );
}
