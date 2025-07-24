// components/video/VideoGrid.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link'; 

interface Video {
  id: string;
  title: string;
  url: string;
}

export function VideoGrid() {
  const { data: videos = [] } = useQuery<Video[]>({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await fetch('/api/cloudinary/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      return res.json();
    },
  });

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {videos.map((v, index) => (
        <motion.div
          key={v.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          {/*
            Best Practice: Use Next.js Link for navigation.
            Wrap it in the Card for styling. The Card itself is not the link.
          */}
          <Link href={`/video/${v.id}`} legacyBehavior={false}>
            <Card className='h-full hover:border-primary transition-colors cursor-pointer'>
              <CardHeader>
                <CardTitle className='truncate'>{v.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* You could show a video thumbnail here */}
                <div className='aspect-video bg-muted rounded-md' />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
