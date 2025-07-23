// /app/api/videos/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper function to fetch the transcript file from Cloudinary's URL
async function fetchTranscript(publicId: string): Promise<string | null> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const transcriptUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.transcript`;

    try {
        console.log(`[API /videos] Fetching transcript from: ${transcriptUrl}`);
        const response = await fetch(transcriptUrl);
        if (!response.ok) {
            console.error(`[API /videos] Failed to fetch transcript file. Status: ${response.status}`);
            return null;
        }
        const transcriptJson = await response.json();
        const fullTranscript = transcriptJson.map((item: { transcript: string }) => item.transcript).join(' ');
        return fullTranscript;
    } catch (error) {
        console.error('[API /videos] Error fetching or parsing transcript:', error);
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[API /videos] Received payload:', body);

        const {
            title,
            cloudinaryPublicId,
            cloudinaryUrl,
            subtitledUrl,
            srtUrl,
            vttUrl,
            folderId,
        } = body;

        if (!title || !cloudinaryPublicId || !cloudinaryUrl || !folderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // --- THIS IS THE NEW, CRITICAL STEP ---
        // Immediately fetch the transcript text now that the upload is done.
        const transcript = await fetchTranscript(cloudinaryPublicId);
        // ------------------------------------

        const video = await prisma.video.create({
            data: {
                title,
                cloudinaryPublicId,
                cloudinaryUrl,
                subtitledUrl,
                srtUrl,
                vttUrl,
                folderId,
                transcript: transcript, // Save the transcript text
                status: 'COMPLETED', // The video is fully ready
            },
        });

        console.log('[API /videos] Successfully created complete video record:', video);
        return NextResponse.json(video);

    } catch (error) {
        console.error('[API /videos] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}