import { PrismaClient } from '@prisma/client'

// This connects to THE KODENAK Studio postgres database
const globalForPrisma = globalThis
export const prisma = globalForPrisma.__theKodenakPrisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.__theKodenakPrisma = prisma
