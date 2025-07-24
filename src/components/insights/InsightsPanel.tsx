// components/insights/InsightsPanel.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useChat } from 'ai/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  Send,
  Sparkles,
  Share2,
  RefreshCw,
  Download,
  Save,
} from 'lucide-react';
import type { Video } from '@prisma/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TranscriptCue {
  timestamp: string;
  text: string;
}

interface InsightsPanelProps {
  video: Video;
}

export function InsightsPanel({ video }: InsightsPanelProps) {
  const router = useRouter();
  const [generatedPost, setGeneratedPost] = useState<string | null>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [cues, setCues] = useState<TranscriptCue[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Parse transcript data
  useEffect(() => {
    if (!video.transcript) return;

    try {
      if (video.transcript.startsWith('[')) {
        setCues(JSON.parse(video.transcript));
      } else {
        setCues([{ timestamp: 'Content', text: video.transcript }]);
      }
    } catch (error) {
      console.error('Failed to parse transcript', error);
      setCues([{ timestamp: 'Content', text: video.transcript }]);
    }
  }, [video.transcript]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading: isChatLoading,
  } = useChat({
    api: '/api/openai/chat',
    body: { videoId: video.id },
    initialMessages: video.summary
      ? [
          {
            id: 'initial-summary',
            role: 'assistant',
            content: `**Summary:**\n${video.summary}`,
          },
        ]
      : [],
  });

  const generateSummary = useMutation({
    mutationFn: (videoId: string) =>
      fetch('/api/openai/summarize', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error('Failed to generate summary');
      toast.success('Summary generated!');
      router.refresh();
    },
    onError: (error: Error) =>
      toast.error('Summary failed', { description: error.message }),
  });

  const generatePost = useMutation({
    mutationFn: ({
      videoId,
      platform,
    }: {
      videoId: string;
      platform: string;
    }) =>
      fetch('/api/openai/social-post', {
        method: 'POST',
        body: JSON.stringify({ videoId, platform }),
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => res.json()),
    onSuccess: (data) => {
      if (data.error) throw new Error(data.error);
      setGeneratedPost(data.socialPost);
      setIsPostDialogOpen(true);
      toast.success('Social post generated!');
    },
    onError: (error: Error) =>
      toast.error('Post failed', { description: error.message }),
  });

  const checkStatus = useMutation({
    mutationFn: (publicId: string) =>
      fetch(`/api/cloudinary/status/${publicId.replace(/\//g, '_')}`),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (data.status === 'complete') {
        toast.success('Transcript ready!');
        router.refresh();
      } else {
        toast.info('Processing...', { description: `Status: ${data.status}` });
      }
    },
    onError: (error: Error) =>
      toast.error('Status check failed', { description: error.message }),
  });

  const loadTranscript = useMutation({
    mutationFn: (videoId: string) =>
      fetch('/api/transcript', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error('Failed to load transcript');
      toast.success('Transcript loaded!');
      router.refresh();
    },
    onError: (error: Error) =>
      toast.error('Load failed', { description: error.message }),
  });

  const saveTranscript = useMutation({
    mutationFn: (data: { videoId: string; cues: TranscriptCue[] }) =>
      fetch('/api/transcript/update', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error('Failed to save transcript');
      toast.success('Transcript saved!');
      setIsEditing(false);
    },
    onError: (error: Error) =>
      toast.error('Save failed', { description: error.message }),
  });

  const handleCueChange = useCallback((index: number, text: string) => {
    setCues((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], text };
      return updated;
    });
    setIsEditing(true);
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!generatedPost) return;
    navigator.clipboard.writeText(generatedPost);
    toast.success('Copied to clipboard!');
  }, [generatedPost]);

  return (
    <>
      <Card className='h-full flex flex-col shadow-lg'>
        <Tabs defaultValue='chat' className='h-full flex flex-col'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Bot className='h-5 w-5' /> AI Tools
                </CardTitle>
                <CardDescription>
                  Chat, generate content, or edit the transcript
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value='chat'>Chat & Insights</TabsTrigger>
                <TabsTrigger value='editor' disabled={!video.vttUrl}>
                  Transcript Editor
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <TabsContent
            value='chat'
            className='flex-1 flex flex-col gap-4 overflow-hidden'
          >
            <CardContent className='flex-1 flex flex-col gap-4 overflow-hidden'>
              <div className='flex flex-wrap gap-2'>
                {video.status === 'PROCESSING' && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => checkStatus.mutate(video.cloudinaryPublicId)}
                    disabled={checkStatus.isPending}
                  >
                    {checkStatus.isPending ? (
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <RefreshCw className='mr-2 h-4 w-4' />
                    )}
                    Check Status
                  </Button>
                )}
                {video.transcript && !video.summary && (
                  <Button
                    size='sm'
                    onClick={() => generateSummary.mutate(video.id)}
                    disabled={generateSummary.isPending}
                  >
                    {generateSummary.isPending ? (
                      <Sparkles className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Sparkles className='mr-2 h-4 w-4' />
                    )}
                    Generate Summary
                  </Button>
                )}
                {video.transcript && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size='sm'
                        variant='outline'
                        disabled={generatePost.isPending}
                      >
                        {generatePost.isPending ? (
                          <Share2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Share2 className='mr-2 h-4 w-4' />
                        )}
                        Generate Post
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          generatePost.mutate({
                            videoId: video.id,
                            platform: 'linkedin',
                          })
                        }
                      >
                        LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          generatePost.mutate({
                            videoId: video.id,
                            platform: 'twitter',
                          })
                        }
                      >
                        Twitter / X
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          generatePost.mutate({
                            videoId: video.id,
                            platform: 'facebook',
                          })
                        }
                      >
                        Facebook
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <ScrollArea className='flex-1 rounded-lg border p-4'>
                <div className='space-y-4'>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-start gap-3',
                        m.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'p-3 rounded-lg max-w-[80%]',
                          m.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <div className='prose prose-sm dark:prose-invert max-w-none'>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className='flex items-center gap-3'>
                      <div className='p-3 rounded-lg bg-muted'>
                        <RefreshCw className='h-4 w-4 animate-spin' />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardContent>
              <form onSubmit={handleSubmit} className='flex gap-2'>
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    video.transcript
                      ? 'Ask about the video...'
                      : 'Waiting for transcript...'
                  }
                  className='flex-1'
                  disabled={isChatLoading || !video.transcript}
                  rows={1}
                />
                <Button
                  type='submit'
                  size='icon'
                  disabled={isChatLoading || !video.transcript}
                  className='self-end'
                >
                  <Send size={16} />
                </Button>
              </form>
            </CardContent>
          </TabsContent>

          <TabsContent
            value='editor'
            className='flex-1 flex flex-col overflow-hidden'
          >
            <CardContent className='flex-1 flex flex-col gap-4'>
              {cues.length > 0 ? (
                <div className='flex-1 flex flex-col gap-4 min-h-0'>
                  <div className='flex-1 min-h-0 border rounded-lg'>
                    <ScrollArea className='h-full p-4'>
                      <div className='space-y-4 pr-4'>
                        {cues.map((cue, index) => (
                          <div
                            key={index}
                            className='grid grid-cols-[auto_1fr] gap-3'
                          >
                            <div className='text-xs text-muted-foreground font-mono bg-muted p-2 rounded text-center'>
                              {cue.timestamp}
                            </div>
                            <Textarea
                              value={cue.text}
                              onChange={(e) =>
                                handleCueChange(index, e.target.value)
                              }
                              className='text-sm min-h-[60px]'
                            />
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>

                  {isEditing && (
                    <div className='pt-2 border-t'>
                      <Button
                        onClick={() =>
                          saveTranscript.mutate({ videoId: video.id, cues })
                        }
                        disabled={saveTranscript.isPending}
                        className='w-full'
                      >
                        {saveTranscript.isPending ? (
                          <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Save className='mr-2 h-4 w-4' />
                        )}
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex-1 flex flex-col items-center justify-center gap-4'>
                  <p className='text-sm text-muted-foreground text-center'>
                    Load the VTT file to start editing the transcript
                  </p>
                  <Button
                    onClick={() => loadTranscript.mutate(video.id)}
                    disabled={loadTranscript.isPending}
                  >
                    {loadTranscript.isPending ? (
                      <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Download className='mr-2 h-4 w-4' />
                    )}
                    Load Transcript
                  </Button>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Generated Social Post</DialogTitle>
            <DialogDescription>
              Copy the post content to share on social media
            </DialogDescription>
          </DialogHeader>
          <div className='prose prose-sm dark:prose-invert bg-muted/50 p-4 rounded-md max-h-[50vh] overflow-auto'>
            <pre className='whitespace-pre-wrap'>{generatedPost}</pre>
          </div>
          <Button onClick={copyToClipboard} className='mt-2'>
            Copy to Clipboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
