// /app/api/openai/social-post/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { openai } from '@/lib/openai';

// Helper function to get the right prompt for each platform
const getPromptForPlatform = (platform: string, transcript: string, summary: string | null) => {
    const contentBase = summary ? `based on the following summary: "${summary}"` : `based on the following video transcript: "${transcript.substring(0, 4000)}"`;

    switch (platform) {
        case 'linkedin':
            return `Create a professional LinkedIn post to promote a new video. The post should be engaging, informative, and encourage clicks. It should be around 3-5 paragraphs and include 3-5 relevant business hashtags. The post is ${contentBase}`;
        case 'twitter':
            return `Generate a short, punchy tweet (under 280 characters) to promote a new video. It should be exciting, use 2-3 relevant hashtags, and include a clear call-to-action. The tweet is ${contentBase}`;
        case 'facebook':
            return `Write a friendly and engaging Facebook post to promote a new video. The post should ask a question to encourage comments and be written in a slightly more casual tone than LinkedIn. Include a few relevant hashtags. The post is ${contentBase}`;
        default:
            throw new Error('Unsupported platform');
    }
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { videoId, platform } = body;

        if (!videoId || !platform) {
            return new NextResponse('Video ID and platform are required', { status: 400 });
        }

        const video = await prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video || !video.transcript) {
            return new NextResponse('Video or transcript not found', { status: 404 });
        }

        console.log(`[AI] Generating ${platform} post for video: ${video.title}`);

        const prompt = getPromptForPlatform(platform, video.transcript, video.summary);

        const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert social media marketing assistant. Your goal is to generate compelling promotional content for videos.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7, // A bit more creative than the summary
        });

        const socialPost = response.choices[0].message.content;

        if (!socialPost) {
            throw new Error('Failed to generate social post from OpenAI.');
        }

        return NextResponse.json({ socialPost });

    } catch (error) {
        console.error('[API_SOCIAL_POST_ERROR]', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to generate social post', details: errorMessage }, { status: 500 });
    }
}