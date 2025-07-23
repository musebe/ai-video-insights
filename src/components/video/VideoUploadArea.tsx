// src/components/video/VideoUploadArea.tsx

'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Folder, Video } from '@prisma/client';

// Cloudinary widget typings
interface CloudinaryUploadWidgetInfo {
  public_id: string;
  secure_url: string;
  version: number;
  eager?: Array<{ secure_url: string }>;
  original_filename?: string;
}
interface CloudinaryUploadWidgetResult {
  event: 'success';
  info: CloudinaryUploadWidgetInfo;
}
interface CloudinaryUploadWidget {
  open: () => void;
}

// Merge with Cloudinary’s own Window.cloudinary type
declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (
        options: Record<string, unknown>,
        callback: (
          error: Error | null,
          result: CloudinaryUploadWidgetResult | null
        ) => void
      ) => CloudinaryUploadWidget;
      // Avoid `any` by using `unknown`
      videoPlayer: (
        element: HTMLVideoElement,
        options: Record<string, unknown>
      ) => unknown;
    };
  }
}

export function VideoUploadArea() {
  const queryClient = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['folders'],
    queryFn: () => fetch('/api/folders').then((res) => res.json()),
  });

  const saveVideoMutation = useMutation({
    mutationFn: (videoData: {
      title: string;
      cloudinaryPublicId: string;
      cloudinaryUrl: string;
      subtitledUrl: string | null;
      srtUrl: string | null;
      vttUrl: string | null;
      folderId: string;
    }) => {
      console.log('[SAVE VIDEO] Payload →', videoData);
      return fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(err.error || 'Failed to save video.');
          });
        }
        return res.json() as Promise<Video>;
      });
    },
    onSuccess: (newVideo) => {
      toast.success('Video saved!', {
        description: 'Transcription is processing...',
      });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      console.log('[SAVE VIDEO] Successfully created DB record:', newVideo);
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
    const folder = folders.find((f) => f.id === selectedFolder)!;
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
        if (result && result.event === 'success') {
          const info = result.info;
          const subtitledUrl = info.eager?.[0]?.secure_url || null;

          // --- Construct raw transcript URLs based on the returned secure_url ---
          const videoUrl = info.secure_url;
          const baseUrl = videoUrl.replace('/video/upload/', '/raw/upload/');
          const srtUrl = baseUrl.replace(/\.mp4$/, '.srt');
          const vttUrl = baseUrl.replace(/\.mp4$/, '.vtt');
          // -----------------------------------------------------------------------

          console.log('[UPLOAD COMPLETE]');
          console.log(` • SRT URL: ${srtUrl}`);
          console.log(` • VTT URL: ${vttUrl}`);

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
          <UploadCloud /> Upload a New Video
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Select onValueChange={setSelectedFolder} value={selectedFolder || ''}>
          <SelectTrigger>
            <SelectValue placeholder='1. Select a folder' />
          </SelectTrigger>
          <SelectContent>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={openUploadWidget}
          disabled={!selectedFolder || saveVideoMutation.status === 'pending'}
          className='w-full'
        >
          2. Open Upload Widget
        </Button>
      </CardContent>
    </Card>
  );
}
