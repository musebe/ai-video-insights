// /app/api/cloudinary/sign/route.ts

import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configure with your secret key, only needed on the server
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paramsToSign } = body;

        if (!paramsToSign) {
            return NextResponse.json({ error: 'Parameters to sign are required' }, { status: 400 });
        }

        // Generate the secure signature
        const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

        return NextResponse.json({ signature });

    } catch (error) {
        console.error('[API_SIGN_ERROR]', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Failed to generate signature', details: errorMessage }, { status: 500 });
    }
}