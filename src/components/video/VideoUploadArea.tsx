// components/video/VideoUploadArea.tsx

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileVideo, X } from 'lucide-react';
import { toast } from 'sonner'; // <-- IMPORT a toast function directly from sonner

export function VideoUploadArea() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (videoFile: File) => {
      const formData = new FormData();
      formData.append('file', videoFile);

      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        // Grab the error message from the response if possible
        const errorData = await res
          .json()
          .catch(() => ({ message: 'Upload failed' }));
        throw new Error(
          errorData.message || 'Upload failed. Please try again.'
        );
      }
      return res.json();
    },
    onSuccess: () => {
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      // NEW: Call toast functions directly like this
      toast.success('Success!', {
        description: 'Your video has been uploaded and is being processed.',
      });
    },
    onError: (error: Error) => {
      // NEW: Use toast.error for a better visual cue
      toast.error('Upload Error', {
        description: error.message,
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <UploadCloud /> Upload a New Video
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {!file ? (
          <label
            htmlFor='file-upload'
            className='relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors'
          >
            <UploadCloud className='w-8 h-8 text-muted-foreground' />
            <p className='mt-2 text-sm text-muted-foreground'>
              Drag & drop or click to upload
            </p>
            <Input
              id='file-upload'
              type='file'
              className='sr-only'
              accept='video/*'
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
            />
          </label>
        ) : (
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div className='flex items-center gap-3'>
              <FileVideo className='h-6 w-6 text-muted-foreground' />
              <span className='font-medium text-sm'>{file.name}</span>
            </div>
            <Button size='icon' variant='ghost' onClick={() => setFile(null)}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending}
          className='w-full'
        >
          {uploadMutation.isPending ? 'Uploading...' : 'Upload and Process'}
        </Button>
      </CardContent>
    </Card>
  );
}
