// app/api/openai/summarize/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { videoId } = body;

        if (!videoId) {
            return new NextResponse('Video ID is required', { status: 400 });
        }

        // 1. Fetch the video and its transcript from our database
        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video || !video.transcript) {
            return new NextResponse('Video or transcript not found', { status: 404 });
        }

        console.log(`[AI] Generating summary for video: ${video.title}`);

        // 2. Send the transcript to OpenAI for summarization
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // You can use "gpt-4" for higher quality
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant designed to summarize video transcripts concisely. Provide a summary in about 3-4 sentences.',
                },
                {
                    role: 'user',
                    content: `Please summarize the following transcript:\n\n${video.transcript}`,
                },
            ],
            temperature: 0.5, // A lower temperature gives more deterministic results
        });

        const summary = response.choices[0].message.content;

        if (!summary) {
            throw new Error('Failed to generate summary from OpenAI.');
        }

        console.log(`[AI] Summary generated successfully.`);

        // 3. Save the generated summary back to our database
        const updatedVideo = await prisma.video.update({
            where: { id: videoId },
            data: { summary: summary.trim() },
        });

        return NextResponse.json(updatedVideo);

    } catch (error) {
        console.error('[API_SUMMARIZE_ERROR]', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to generate summary', details: errorMessage }, { status: 500 });
    }
}