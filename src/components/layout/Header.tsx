// /components/layout/Header.tsx

import { prisma } from '@/lib/prisma';
import { HeaderActions } from './HeaderActions';

// This is now an async Server Component
export async function Header() {
  // Fetch the real folder and video data from the database
  const foldersWithVideos = await prisma.folder.findMany({
    include: {
      videos: {
        select: {
          id: true,
          title: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <header className='flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30'>
      {/* Render the client component and pass the real data to it */}
      <HeaderActions foldersWithVideos={foldersWithVideos} />
    </header>
  );
}
