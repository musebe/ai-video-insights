// /app/api/openai/chat/route.ts

import { streamText } from 'ai';
import { openai as openaiProvider } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// THE FIX: Remove the 'edge' runtime declaration.
// This will make the route run on the standard Node.js serverless runtime, which supports Prisma.
// export const runtime = 'edge'; 

export async function POST(req: NextRequest) {
    try {
        const { messages, videoId } = await req.json();

        if (!videoId) {
            return new Response('Video ID is required', { status: 400 });
        }

        // This Prisma call will now work correctly.
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { transcript: true, title: true },
        });

        if (!video || !video.transcript) {
            return new Response('Transcript not found for this video', { status: 404 });
        }

        const systemPrompt = `You are an expert AI assistant for the video titled "${video.title}". 
      Your task is to answer questions based ONLY on the provided transcript. 
      Do not make up information or answer questions outside the scope of the transcript. 
      If the answer is not in the transcript, say "I cannot answer that based on the provided transcript."
      Here is the full transcript for your reference:
      ---
      ${video.transcript}
      ---`;

        const result = await streamText({
            model: openaiProvider('gpt-4-turbo'),
            system: systemPrompt,
            messages,
        });

        return result.toDataStreamResponse();

    } catch (error) {
        console.error('[CHAT_API_ERROR]', error);
        return new Response('An error occurred while processing your request.', { status: 500 });
    }
}