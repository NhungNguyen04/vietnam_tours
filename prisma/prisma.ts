/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// import { PrismaClient } from '@prisma/client'
// import { PrismaNeon } from '@prisma/adapter-neon'
// import dotenv from 'dotenv'

// dotenv.config()
// const connectionString = `${process.env.DATABASE_URL}`

// const adapter = new PrismaNeon({ connectionString })
// export const prisma = new PrismaClient({ adapter });