// /app/api/cloudinary/webhook/route.ts

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface TranscriptItem {
    transcript: string;
}

export async function POST(request: Request) {
    console.log(`\n\n[WEBHOOK] INCOMING REQUEST RECEIVED AT: ${new Date().toISOString()}\n\n`);
    try {
        const body = await request.json();
        console.log('[WEBHOOK] Received notification body:', JSON.stringify(body, null, 2));

        if ((body.notification_type === 'raw_convert' || body.info_kind === 'auto_transcription') && body.info_status === 'complete') {
            const publicId = body.public_id;

            const resourceDetails = await cloudinary.api.resource(publicId, {
                resource_type: 'video',
            });

            // --- THE FIX: Construct the correct URLs from the video's main URL ---
            const videoUrl = resourceDetails.secure_url;
            const baseUrl = videoUrl.replace('/video/upload/', '/raw/upload/');
            const srtUrl = baseUrl.replace(/\.mp4$/, '.srt');
            const vttUrl = baseUrl.replace(/\.mp4$/, '.vtt');
            // --------------------------------------------------------------------

            // Fetch the raw transcript text
            const transcriptUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}.transcript`;
            const transcriptResponse = await fetch(transcriptUrl);
            const transcriptJson: TranscriptItem[] = await transcriptResponse.json();
            const fullTranscript = transcriptJson.map((item) => item.transcript).join(' ');

            console.log(`[WEBHOOK] Updating DB for public_id: ${publicId}`);
            console.log(`[WEBHOOK]   -> srtUrl: ${srtUrl}`);
            console.log(`[WEBHOOK]   -> vttUrl: ${vttUrl}`);

            await prisma.video.update({
                where: { cloudinaryPublicId: publicId },
                data: {
                    transcript: fullTranscript,
                    status: 'COMPLETED',
                    srtUrl: srtUrl,
                    vttUrl: vttUrl,
                },
            });

            console.log(`[WEBHOOK] Successfully updated transcript and subtitle URLs for public_id: ${publicId}`);
        } else {
            console.log('[WEBHOOK] Received a notification that was not a completed transcription. Skipping.');
        }

        return new NextResponse('Webhook received', { status: 200 });

    } catch (error) {
        console.error('[WEBHOOK] Error processing webhook:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}