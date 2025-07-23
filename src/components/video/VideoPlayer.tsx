// /components/video/VideoPlayer.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Video } from '@prisma/client';
import { CldVideoPlayer } from 'next-cloudinary'; // Import the official player
import 'next-cloudinary/dist/cld-video-player.css'; // Import the player's CSS

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  // Check if the transcript and VTT URL are ready
  const hasSubtitles = video.status === 'COMPLETED' && video.vttUrl;

  return (
    <Card className='shadow-lg'>
      <CardHeader>
        <CardTitle>{video.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='aspect-video w-full overflow-hidden rounded-lg bg-black'>
          <CldVideoPlayer
            width='1920'
            height='1080'
            src={video.cloudinaryPublicId} // The source is the publicId
            // --- THE FIX: Use the `textTracks` prop exactly as in the docs ---
            textTracks={
              hasSubtitles
                ? {
                    captions: {
                      label: 'English',
                      language: 'en',
                      default: true,
                      url: video.vttUrl!, // Use the VTT URL from our database
                    },
                  }
                : {}
            }
          />
        </div>
        {hasSubtitles && (
          <p className='text-xs text-muted-foreground mt-2'>
            Subtitles are available. Use the CC button in the player.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
