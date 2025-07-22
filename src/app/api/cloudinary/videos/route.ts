// app/api/cloudinary/videos/route.ts

import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

// Best Practice: Revalidate the cache for this route every 60 seconds.
export const revalidate = 60;

// Define a type for the Cloudinary resource object for clarity and type safety
interface CloudinaryResource {
    public_id: string;
    filename?: string; // Filename can be optional
    secure_url: string;
}

export async function GET() {
    try {
        console.log('[Cloudinary] Fetching video list...');

        const { resources }: { resources: CloudinaryResource[] } = await cloudinary.api.resources({
            resource_type: 'video',
            type: 'upload',
            prefix: 'ai-videos/',
            max_results: 50,
        });

        console.log(`[Cloudinary] Found ${resources.length} videos.`);

        // THE FIX: We explicitly tell TypeScript that 'res' is a CloudinaryResource
        const videos = resources.map((res: CloudinaryResource) => ({
            id: res.public_id,
            title: res.filename || res.public_id.split('/').pop(),
            url: res.secure_url,
        }));

        return NextResponse.json(videos);

    } catch (error) {
        console.error('[Cloudinary] Failed to fetch videos:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to fetch videos.', details: errorMessage }, { status: 500 });
    }
}