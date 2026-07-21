import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

import path from 'path'

const getPrismaInstance = () => {
  const rawUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  const dbUrl = rawUrl.startsWith('file:') && !rawUrl.startsWith('file:/')
    ? 'file:' + path.resolve(process.cwd(), rawUrl.slice(5))
    : rawUrl

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
