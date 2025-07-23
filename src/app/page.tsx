// app/page.tsx

import { VideoUploadArea } from '@/components/video/VideoUploadArea';

export default function HomePage() {
  return (
    <div className='space-y-8'>
      {/* The main page is now dedicated to uploading. 
        Video listing is handled by the new folder-based sidebar.
      */}
      <VideoUploadArea />
    </div>
  );
}
