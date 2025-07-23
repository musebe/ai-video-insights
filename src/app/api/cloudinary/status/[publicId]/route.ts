// /app/api/cloudinary/status/[publicId]/route.ts

import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Type definitions...
interface GoogleSpeechAlternative {
    transcript: string;
}
interface GoogleSpeechResult {
    alternatives: GoogleSpeechAlternative[];
}
interface DerivedAsset {
    format: string;
    secure_url: string;
}

export async function GET(
    request: Request,
    // FIX #1: Pass the entire context object to avoid the Next.js 15 error
    context: { params: { publicId: string } }
) {
    try {
        // Access params from the context object
        const publicId = context.params.publicId.replace(/_/g, '/');
        console.log(`[STATUS_API] Checking status for publicId: ${publicId}`);

        const resourceDetails = await cloudinary.api.resource(publicId, {
            resource_type: 'video',
            info: true,
            derived: true,
        });

        // FIX #2: The transcription status is in a different location for this API call.
        // We check the `resourceDetails.info.raw_convert.status` path.
        const transcriptionStatus = resourceDetails.info?.raw_convert?.status;
        console.log('[STATUS_API] Cloudinary transcription status:', transcriptionStatus);

        if (transcriptionStatus === 'complete') {
            console.log('[STATUS_API] Transcription is complete! Processing results...');

            const transcriptData = resourceDetails.info.raw_convert.google_speech.data;
            const fullTranscript = transcriptData
                .map((item: GoogleSpeechResult) => item.alternatives[0].transcript)
                .join(' ');

            const derivedAssets: DerivedAsset[] = resourceDetails.derived || [];
            const srtAsset = derivedAssets.find((d: DerivedAsset) => d.format === 'srt');
            const vttAsset = derivedAssets.find((d: DerivedAsset) => d.format === 'vtt');
            const srtUrl = srtAsset ? srtAsset.secure_url : null;
            const vttUrl = vttAsset ? vttAsset.secure_url : null;

            console.log(`[STATUS_API] Updating transcript and subtitle URLs in DB for publicId: ${publicId}`);
            const updatedVideo = await prisma.video.update({
                where: { cloudinaryPublicId: publicId },
                data: {
                    transcript: fullTranscript,
                    status: 'COMPLETED',
                    srtUrl: srtUrl,
                    vttUrl: vttUrl,
                },
            });

            console.log("\n--- TRANSCRIPTION RESULTS ---");
            console.log("Original Video URL:", updatedVideo.cloudinaryUrl);
            console.log("SRT File URL:", srtUrl || "Not found");
            console.log("VTT File URL:", vttUrl || "Not found");
            console.log("-----------------------------\n");

            return NextResponse.json({ status: 'complete', video: updatedVideo });
        } else {
            console.log('[STATUS_API] Transcription is still pending or failed.');
            return NextResponse.json({ status: transcriptionStatus || 'pending' });
        }
    } catch (error) {
        console.error('[STATUS_API] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to check status', details: errorMessage }, { status: 500 });
    }
}