// app/api/folders/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to fetch all folders
export async function GET() {
    try {
        const folders = await prisma.folder.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(folders);
    } catch (error) {
        console.error('[API_FOLDERS_GET]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

// POST handler to create a new folder
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return new NextResponse('Folder name is required', { status: 400 });
        }

        const folder = await prisma.folder.create({
            data: {
                name,
            },
        });

        return NextResponse.json(folder);
    } catch (error) {
        console.error('[API_FOLDERS_POST]', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}