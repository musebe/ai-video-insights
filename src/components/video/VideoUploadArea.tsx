'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import type { Folder, Video } from '@prisma/client';


// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function VideoUploadArea() {
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Fixed: Removed onError from useQuery options
  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: async () => {
      const res = await fetch('/api/folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
  });

  const saveVideoMutation = useMutation({
    mutationFn: async (videoData: {
      title: string;
      cloudinaryPublicId: string;
      cloudinaryUrl: string;
      subtitledUrl: string | null;
      srtUrl: string | null;
      vttUrl: string | null;
      folderId: string;
    }) => {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save video');
      }
      return res.json() as Promise<Video>;
    },
    // Fixed: Removed unused newVideo parameter
    onSuccess: () => {
      toast.success('Video saved!', {
        description: 'Transcription is processing...',
      });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to save video', { description: error.message });
    },
  });

  const openUploadWidget = () => {
    if (!selectedFolder) {
      toast.warning('Please select a folder first.');
      return;
    }

    // Fixed: Added explicit type to folder parameter
    const folder = folders.find((f: Folder) => f.id === selectedFolder);
    if (!folder) {
      toast.error('Selected folder not found');
      return;
    }

    const folderName = folder.name.replace(/\s+/g, '_').toLowerCase();

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: 'ai_video_final',
        resourceType: 'video',
        clientAllowedFormats: ['mp4', 'mov', 'webm', 'ogg'],
        folder: `ai-videos/${folderName}`,
        sources: ['local', 'camera'],
        multiple: false,
      },
      (error, result) => {
        if (error) {
          toast.error('Upload Error', { description: error.message });
          return;
        }

        if (result?.event === 'success') {
          const info = result.info;
          const subtitledUrl = info.eager?.[0]?.secure_url || null;

          // Generate transcript URLs
          const videoUrl = info.secure_url;
          const baseUrl = videoUrl.replace('/video/upload/', '/raw/upload/');
          const extension = videoUrl.split('.').pop() || 'mp4';
          const srtUrl = baseUrl.replace(`.${extension}`, '.srt');
          const vttUrl = baseUrl.replace(`.${extension}`, '.vtt');

          saveVideoMutation.mutate({
            title: info.original_filename || 'Untitled Video',
            cloudinaryPublicId: info.public_id,
            cloudinaryUrl: videoUrl,
            subtitledUrl,
            srtUrl,
            vttUrl,
            folderId: selectedFolder,
          });
        }
      }
    );

    widget.open();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UploadCloud size={20} /> Upload a New Video
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Select
          onValueChange={setSelectedFolder}
          value={selectedFolder || ''}
          disabled={saveVideoMutation.isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a folder' />
          </SelectTrigger>
          <SelectContent>
            {/* Fixed: Added explicit type to folder parameter */}
            {folders.map((folder: Folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={openUploadWidget}
          disabled={!selectedFolder || saveVideoMutation.isPending}
          className='w-full'
        >
          {saveVideoMutation.isPending ? 'Processing...' : 'Open Upload Widget'}
        </Button>
      </CardContent>
    </Card>
  );
}
