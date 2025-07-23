// /app/api/transcript/update/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier'; 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to convert our JSON back into a VTT string
function convertCuesToVTT(cues: { timestamp: string; text: string }[]) {
    let vttString = 'WEBVTT\n\n';
    cues.forEach((cue, index) => {
        vttString += `${index + 1}\n`;
        vttString += `${cue.timestamp}\n`;
        vttString += `${cue.text}\n\n`;
    });
    return vttString;
}

export async function POST(request: Request) {
    try {
        const { videoId, cues } = await request.json();
        if (!videoId || !cues) {
            return new NextResponse('Video ID and cues are required', { status: 400 });
        }

        const video = await prisma.video.findUnique({ where: { id: videoId } });
        if (!video) {
            return new NextResponse('Video not found', { status: 404 });
        }

        // 1. Convert cues back to VTT format
        const newVttContent = convertCuesToVTT(cues);
        const transcriptJson = JSON.stringify(cues);

        // 2. Overwrite the old VTT file on Cloudinary using a stream
        console.log(`[API /transcript/update] Overwriting VTT for public_id: ${video.cloudinaryPublicId}`);

        // Use `upload_stream` to handle the raw VTT content as a buffer
        await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: `${video.cloudinaryPublicId}.vtt`,
                    resource_type: 'raw',
                    overwrite: true,
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(newVttContent).pipe(uploadStream);
        });

        // 3. Save the updated JSON to our database
        await prisma.video.update({
            where: { id: videoId },
            data: { transcript: transcriptJson },
        });

        return NextResponse.json({ message: 'Transcript updated successfully' });
    } catch (error) {
        console.error('[API /transcript/update] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to update transcript', details: errorMessage }, { status: 500 });
    }
}