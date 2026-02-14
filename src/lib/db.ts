/**
 * @file db.ts
 * @description Database connection utility using Prisma Client.
 * @module Lib/DB
 * 
 * Purpose:
 * - Initializes a single instance of PrismaClient to avoid multiple connection warnings
 *   during hot-reloads in Next.js development.
 * 
 * Dependencies:
 * - @prisma/client
 */

import { PrismaClient } from '@prisma/client'

/**
 * Creates a new instance of PrismaClient.
 * @returns {PrismaClient} A new PrismaClient instance.
 */
const prismaClientSingleton = () => {
    return new PrismaClient()
}

// Global declaration to allow attaching prisma to the global object in development
declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Use existing global instance if available, otherwise create a new one
const db = globalThis.prisma ?? prismaClientSingleton()

export default db

// Store the instance in the global object in non-production environments
// to persist the connection across hot reloads.
if (process.env.NODE_ENV !== 'production') globalThis.prisma = db

