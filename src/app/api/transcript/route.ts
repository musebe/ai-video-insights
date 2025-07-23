import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// A simple VTT parser
function parseVTT(vttContent: string) {
    const lines = vttContent.split('\n');
    const cues = [];
    let currentCue = null;

    for (const line of lines) {
        if (line.includes('-->')) {
            if (currentCue) cues.push(currentCue);
            currentCue = { timestamp: line.trim(), text: '' };
        } else if (currentCue && line.trim() !== '' && !/^\d+$/.test(line.trim())) {
            currentCue.text += (currentCue.text ? '\n' : '') + line.trim();
        }
    }
    if (currentCue) cues.push(currentCue);
    return cues;
}

export async function POST(request: Request) {
    try {
        const { videoId } = await request.json();
        if (!videoId) {
            return new NextResponse('Video ID is required', { status: 400 });
        }

        const video = await prisma.video.findUnique({ where: { id: videoId } });

        if (!video || !video.vttUrl) {
            return new NextResponse('Video or VTT URL not found', { status: 404 });
        }

        console.log(`[API /transcript] Fetching VTT content from: ${video.vttUrl}`);
        const vttResponse = await fetch(video.vttUrl);
        if (!vttResponse.ok) {
            throw new Error('Failed to fetch VTT file from Cloudinary.');
        }
        const vttContent = await vttResponse.text();

        const parsedCues = parseVTT(vttContent);
        const transcriptJson = JSON.stringify(parsedCues);

        console.log(`[API /transcript] Saving parsed transcript to DB for videoId: ${videoId}`);
        const updatedVideo = await prisma.video.update({
            where: { id: videoId },
            data: { transcript: transcriptJson },
        });

        return NextResponse.json(updatedVideo);

    } catch (error) {
        console.error('[API /transcript] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to process transcript', details: errorMessage }, { status: 500 });
    }
}