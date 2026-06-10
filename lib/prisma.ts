import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getPrismaInstance = () => {
  // libsql resolves file: URLs relative to the process CWD (project root),
  // which is the same base the Prisma CLI uses via prisma.config.ts. Keep the
  // URL as-is so migrations/seeds and the running app share one database file.
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'

  const adapter = new PrismaLibSql({
    url: dbUrl,
  })

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? getPrismaInstance()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
