// /app/api/upload/route.ts

import { NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- THIS IS THE CRITICAL FIX ---
// Increase the body size limit for this specific API route.
// This allows large video files to be received by the server.
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '500mb', // Set a reasonable limit, e.g., 500MB
        },
    },
};
// ---------------------------------

interface EagerTransformationResult {
    secure_url: string;
}
type CustomUploadApiResponse = UploadApiResponse & {
    eager?: EagerTransformationResult[];
};

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const folderId = formData.get('folderId') as string | null;
        const folderName = formData.get('folderName') as string | null;

        if (!file || !folderId || !folderName) {
            return NextResponse.json({ error: 'Missing file or folder information' }, { status: 400 });
        }

        console.log(`[API /upload] Received file: ${file.name} for folder: ${folderName}`);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const tempFilePath = path.join(os.tmpdir(), file.name);
        await writeFile(tempFilePath, buffer);
        console.log(`[API /upload] File saved to temporary path: ${tempFilePath}`);

        const videoPublicId = `${folderName}/${file.name.split('.')[0]}-${Date.now()}`;
        const transcriptPublicId = `${videoPublicId}.transcript`;

        const result: CustomUploadApiResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(
                tempFilePath,
                {
                    resource_type: 'video',
                    public_id: videoPublicId,
                    raw_convert: 'google_speech:srt:vtt',
                    eager: [
                        {
                            resource_type: 'video',
                            transformation: [
                                { overlay: { resource_type: 'subtitles', public_id: transcriptPublicId } },
                                { flags: 'layer_apply' },
                            ],
                        },
                    ],
                    chunk_size: 6000000,
                },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error('Cloudinary did not return a result.'));
                    resolve(result);
                }
            );
        });

        console.log('[API /upload] Cloudinary upload successful. Creating DB record...');
        const subtitledUrl = result.eager && result.eager[0] ? result.eager[0].secure_url : null;

        const video = await prisma.video.create({
            data: {
                title: result.original_filename || file.name,
                cloudinaryPublicId: result.public_id,
                cloudinaryUrl: result.secure_url,
                folderId: folderId,
                status: 'PROCESSING',
                subtitledUrl: subtitledUrl,
            },
        });

        console.log('[API /upload] Successfully created video record:', video);
        console.log('🔥 Subtitled Video URL (will be ready after processing):', subtitledUrl);
        return NextResponse.json({ success: true, video });

    } catch (error) {
        console.error('[API /upload] Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Upload failed', details: errorMessage }, { status: 500 });
    }
}