// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// Declare a global variable to hold the Prisma client instance.
// This prevents re-creating the client on every hot reload in development.
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;