// app/api/cloudinary/upload/route.ts

import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary'; // <-- Import our centralized config

export async function POST(request: Request) {
    // 1. Get the file from the form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    try {
        console.log(`[Cloudinary] Starting upload for file: ${file.name}`);

        // 2. Convert the file into a byte array
        const fileBuffer = await file.arrayBuffer();
        const mime = file.type;
        const encoding = 'base64';
        const base64Data = Buffer.from(fileBuffer).toString('base64');
        const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;

        // 3. Use `upload` with the data URI. This is a reliable way to upload
        // the buffer content. For true chunked streaming from the client, a more
        // complex setup with signed uploads is needed, but this server-side
        // stream is robust for typical serverless function limits.
        const result = await cloudinary.uploader.upload(fileUri, {
            resource_type: 'video',
            folder: 'ai-videos',
            chunk_size: 6000000, // Optional: Upload in 6MB chunks
        });

        console.log(`[Cloudinary] Upload successful for public_id: ${result.public_id}`);

        // 4. Return a success response
        return NextResponse.json({
            id: result.public_id,
            url: result.secure_url,
            title: result.original_filename || file.name,
        });

    } catch (error) {
        console.error('[Cloudinary] Upload Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to upload file.', details: errorMessage }, { status: 500 });
    }
}