// components/layout/SettingsPanel.tsx

'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResizableHandle, ResizablePanel } from '@/components/ui/resizable';
import { Switch } from '@/components/ui/switch';
import { useUIStore } from '@/lib/use-ui-store';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';

export function SettingsPanel() {
  const store = useUIStore();

  // Don't render anything if the panel is closed. This is key for the collapsible behavior.
  if (!store.isSettingsOpen) {
    return null;
  }

  return (
    <>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={25}
        maxSize={30}
        minSize={20}
        id='settings-panel'
      >
        <div className='flex h-full flex-col p-4'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-lg font-semibold'>Settings</h2>
            <Button variant='ghost' size='icon' onClick={store.closeSettings}>
              <X className='h-4 w-4' />
              <span className='sr-only'>Close</span>
            </Button>
          </div>
          <Separator />
          <div className='flex-1 overflow-y-auto py-6 space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
                <CardDescription>
                  Manage how AI generates insights from your videos.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between space-x-2'>
                  <Label
                    htmlFor='ai-enabled'
                    className='flex flex-col space-y-1'
                  >
                    <span>Enable AI Insights</span>
                    <span className='font-normal text-sm text-muted-foreground'>
                      Uses OpenAI to generate summaries and highlights.
                    </span>
                  </Label>
                  <Switch
                    id='ai-enabled'
                    checked={store.aiEnabled}
                    onCheckedChange={store.toggleAI}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='api-key'>OpenAI API Key</Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      id='api-key'
                      type='password'
                      value={store.apiKey}
                      onChange={(e) => store.setApiKey(e.target.value)}
                      placeholder='sk-...'
                      className='flex-grow'
                    />
                    <Button variant='outline'>Test</Button>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    Your key is stored securely and never exposed client-side.
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* You can add more settings cards here for other options */}
          </div>
          <div className='mt-auto border-t pt-4'>
            <Button className='w-full' onClick={store.closeSettings}>
              Save Changes
            </Button>
          </div>
        </div>
      </ResizablePanel>
    </>
  );
}
