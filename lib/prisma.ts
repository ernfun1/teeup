import { PrismaClient } from '@prisma/client'

// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Fix for prepared statement error with pgbouncer
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] as const
      : ['error'] as const,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} 