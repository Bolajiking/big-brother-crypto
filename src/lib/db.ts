import { PrismaClient } from '@prisma/client';

// Declare global type for Prisma client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client
// In development, we store it on globalThis to prevent multiple instances
// due to hot module reloading
export const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
