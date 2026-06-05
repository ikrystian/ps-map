import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const getPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
  console.log("prisma.ts getPrismaInstance called. process.env.DATABASE_URL:", process.env.DATABASE_URL, "dbUrl:", dbUrl)
  
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
