// components/layout/CreateFolderDialog.tsx

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

export function CreateFolderDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (folderName: string) => {
      return fetch('/api/folders', {
        method: 'POST',
        body: JSON.stringify({ name: folderName }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: async (res) => {
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to create folder');
      }
      toast.success('Folder created successfully!');
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setIsOpen(false);
      setName('');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (name.trim()) {
      mutation.mutate(name.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' className='w-full justify-start'>
          <PlusCircle className='mr-2 h-4 w-4' />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Give your new folder a name. You can add videos to it later.
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='col-span-3'
              placeholder='e.g., Marketing Videos'
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='submit'
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
