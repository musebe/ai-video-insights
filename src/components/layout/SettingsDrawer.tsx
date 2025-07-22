// components/layout/SettingsDrawer.tsx

'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription, // Added for better context
  SheetFooter, // Added for footer actions
} from '@/components/ui/sheet'; // <-- Changed from 'drawer' to 'sheet'
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/lib/use-ui-store';

export default function SettingsSheet() {
  // This selector is excellent. It ensures the component only re-renders
  // when these specific values change. This is a great practice for performance.
  const {
    isSettingsOpen,
    closeSettings,
    aiEnabled,
    toggleAI,
    apiKey,
    setApiKey,
  } = useUIStore((s) => ({
    isSettingsOpen: s.isSettingsOpen,
    closeSettings: s.closeSettings,
    aiEnabled: s.aiEnabled,
    toggleAI: s.toggleAI,
    apiKey: s.apiKey,
    setApiKey: s.setApiKey,
  }));

  // The onOpenChange callback receives a boolean `open`.
  // We only call closeSettings when it's being closed (open === false).
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeSettings();
    }
  };

  return (
    <Sheet open={isSettingsOpen} onOpenChange={handleOpenChange}>
      <SheetContent side='right'>
        {' '}
        {/* The 'side' prop works here! */}
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Manage your application and AI settings here.
          </SheetDescription>
        </SheetHeader>
        {/* This is the replacement for DrawerBody */}
        <div className='grid gap-4 py-4'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <Label htmlFor='toggle-ai' className='flex flex-col space-y-1'>
              <span>Enable AI Insights</span>
              <span className='font-normal leading-snug text-muted-foreground'>
                Allow using OpenAI to generate insights.
              </span>
            </Label>
            <Switch
              id='toggle-ai'
              checked={aiEnabled}
              onCheckedChange={toggleAI}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='api-key'>OpenAI API Key</Label>
            <Input
              id='api-key'
              type='password'
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder='sk-...'
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={closeSettings}>Save Changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
