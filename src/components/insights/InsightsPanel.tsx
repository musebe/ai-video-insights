'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  Share2,
  Copy,
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

  useEffect(() => {
    if (video.transcript && video.transcript.startsWith('[')) {
      try {
        const parsedCues = JSON.parse(video.transcript);
        if (Array.isArray(parsedCues)) {
          setCues(parsedCues);
        }
      } catch {
        // THE FIX: Removed the unused '(e)' variable
        console.error('Failed to parse transcript JSON');
        // Fallback for non-JSON transcripts (like old summaries)
        setCues([{ timestamp: 'Content', text: video.transcript }]);
      }
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

  const generateSummaryMutation = useMutation({
    mutationFn: (videoId: string) =>
      fetch('/api/openai/summarize', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error('Failed to generate summary.');
      toast.success('Summary generated!');
      router.refresh();
    },
    onError: (error: Error) =>
      toast.error('Summary Generation Failed', { description: error.message }),
  });

  const generatePostMutation = useMutation({
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
      toast.error('Post Generation Failed', { description: error.message }),
  });

  const checkStatusMutation = useMutation({
    mutationFn: (publicId: string) =>
      fetch(`/api/cloudinary/status/${publicId.replace(/\//g, '_')}`),
    onSuccess: async (res) => {
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      const data = await res.json();
      if (data.status === 'complete') {
        toast.success('Transcript found!');
        router.refresh();
      } else {
        toast.info('Still processing...', {
          description: `Status: ${data.status}`,
        });
      }
    },
    onError: (error: Error) =>
      toast.error('Error Checking Status', { description: error.message }),
  });

  const loadTranscriptMutation = useMutation({
    mutationFn: (videoId: string) =>
      fetch('/api/transcript', {
        method: 'POST',
        body: JSON.stringify({ videoId }),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error('Failed to load transcript.');
      toast.success('Editable transcript loaded!');
      router.refresh();
    },
    onError: (error: Error) =>
      toast.error('Failed to load transcript', { description: error.message }),
  });

  const saveTranscriptMutation = useMutation({
    mutationFn: (data: { videoId: string; cues: TranscriptCue[] }) =>
      fetch('/api/transcript/update', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      }),
    onSuccess: async (res) => {
      if (!res.ok) throw new Error('Failed to save transcript.');
      toast.success('Transcript saved successfully!');
      setIsEditing(false);
    },
    onError: (error: Error) =>
      toast.error('Failed to save transcript', { description: error.message }),
  });

  const handleCueTextChange = (index: number, newText: string) => {
    const updatedCues = [...cues];
    updatedCues[index].text = newText;
    setCues(updatedCues);
    if (!isEditing) setIsEditing(true);
  };

  const handleCopyToClipboard = () => {
    if (generatedPost) {
      navigator.clipboard.writeText(generatedPost);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <>
      <Card className='h-full flex flex-col shadow-lg'>
        <Tabs defaultValue='chat' className='h-full flex flex-col'>
          <CardHeader>
            <div className='flex items-start justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2'>
                  <Bot /> AI Tools
                </CardTitle>
                <CardDescription>
                  Chat, generate content, or edit the transcript.
                </CardDescription>
              </div>
              <TabsList>
                <TabsTrigger value='chat'>Chat & Insights</TabsTrigger>
                <TabsTrigger value='editor' disabled={!video.vttUrl}>
                  Editor
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>

          <TabsContent
            value='chat'
            className='flex-1 flex flex-col gap-4 overflow-y-hidden'
          >
            <CardContent className='flex-1 flex flex-col gap-4 overflow-y-hidden'>
              <div className='flex items-center gap-2 flex-wrap'>
                {video.status === 'PROCESSING' && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() =>
                      checkStatusMutation.mutate(video.cloudinaryPublicId)
                    }
                    disabled={checkStatusMutation.isPending}
                  >
                    {checkStatusMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <RefreshCw className='mr-2 h-4 w-4' />
                    )}
                    Check Status
                  </Button>
                )}
                {video.transcript && !video.summary && (
                  <Button
                    size='sm'
                    onClick={() => generateSummaryMutation.mutate(video.id)}
                    disabled={generateSummaryMutation.isPending}
                  >
                    {generateSummaryMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
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
                        disabled={generatePostMutation.isPending}
                      >
                        {generatePostMutation.isPending ? (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Share2 className='mr-2 h-4 w-4' />
                        )}
                        Generate Post
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() =>
                          generatePostMutation.mutate({
                            videoId: video.id,
                            platform: 'linkedin',
                          })
                        }
                      >
                        LinkedIn
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          generatePostMutation.mutate({
                            videoId: video.id,
                            platform: 'twitter',
                          })
                        }
                      >
                        Twitter / X
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          generatePostMutation.mutate({
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
              <ScrollArea className='flex-1 pr-4 -mr-4'>
                <div className='space-y-4'>
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        'flex items-start gap-3',
                        m.role === 'user' ? 'justify-end' : ''
                      )}
                    >
                      <>
                        {m.role === 'assistant' && (
                          <Bot className='h-6 w-6 text-primary flex-shrink-0' />
                        )}
                      </>
                      <div
                        className={cn(
                          'p-3 rounded-lg max-w-sm',
                          m.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <div className='prose dark:prose-invert text-sm'>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      </div>
                      <>
                        {m.role === 'user' && (
                          <User className='h-6 w-6 text-muted-foreground flex-shrink-0' />
                        )}
                      </>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className='flex items-center gap-3'>
                      <Bot className='h-6 w-6 text-primary animate-pulse' />
                      <div className='p-3 rounded-lg bg-muted'>
                        <Loader2 className='h-4 w-4 animate-spin' />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <form
                onSubmit={handleSubmit}
                className='w-full flex items-center gap-2'
              >
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    video.transcript
                      ? 'Ask about the Project Nova launch...'
                      : 'Waiting for transcript...'
                  }
                  className='flex-grow'
                  disabled={isChatLoading || !video.transcript}
                />
                <Button
                  type='submit'
                  size='icon'
                  disabled={isChatLoading || !video.transcript}
                >
                  <Send size={18} />
                </Button>
              </form>
            </CardFooter>
          </TabsContent>

          <TabsContent
            value='editor'
            className='flex-1 flex flex-col gap-4 overflow-y-hidden'
          >
            <CardContent className='flex-1 flex flex-col gap-4'>
              {cues.length > 0 ? (
                <>
                  <ScrollArea className='flex-1 pr-4 -mr-4'>
                    <div className='space-y-4'>
                      {cues.map((cue, index) => (
                        <div
                          key={index}
                          className='grid grid-cols-[auto_1fr] items-start gap-4'
                        >
                          <div className='text-xs text-muted-foreground font-mono bg-muted p-2 rounded-md text-center pt-4'>
                            {cue.timestamp.replace('-->', '\n')}
                          </div>
                          <Textarea
                            value={cue.text}
                            onChange={(e) =>
                              handleCueTextChange(index, e.target.value)
                            }
                            className='text-sm w-full'
                            rows={3}
                          />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {isEditing && (
                    <Button
                      onClick={() =>
                        saveTranscriptMutation.mutate({
                          videoId: video.id,
                          cues,
                        })
                      }
                      disabled={saveTranscriptMutation.isPending}
                    >
                      {saveTranscriptMutation.isPending ? (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      ) : (
                        <Save className='mr-2 h-4 w-4' />
                      )}
                      Save Changes
                    </Button>
                  )}
                </>
              ) : (
                <div className='flex-1 flex flex-col items-center justify-center'>
                  <p className='text-sm text-muted-foreground mb-4'>
                    Load the VTT file to start editing.
                  </p>
                  <Button
                    onClick={() => loadTranscriptMutation.mutate(video.id)}
                    disabled={loadTranscriptMutation.isPending}
                  >
                    {loadTranscriptMutation.isPending ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Download className='mr-2 h-4 w-4' />
                    )}
                    Load Editable Transcript
                  </Button>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Generated Social Post</DialogTitle>
            <DialogDescription>
              Review and copy the generated post below.
            </DialogDescription>
          </DialogHeader>
          <div className='prose dark:prose-invert text-sm whitespace-pre-wrap bg-muted p-4 rounded-md'>
            {generatedPost}
          </div>
          <Button onClick={handleCopyToClipboard} className='mt-4 w-full'>
            <Copy className='mr-2 h-4 w-4' />
            Copy to Clipboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
