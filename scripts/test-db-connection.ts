import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection(url: string | undefined, name: string) {
    if (!url) {
        console.log(`[${name}] SKIPPED: URL not found in environment`)
        return
    }

    console.log(`\nTesting ${name}...`)
    console.log('URL:', url.replace(/:[^:]+@/, ':****@'))

    // Create a dedicated client for this URL to ensure we test specific connection
    const client = new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
    })

    try {
        await client.$connect()
        // Simple query to verify read access
        const count = await client.user.count()
        console.log(`[${name}] SUCCESS: Connected and queried. User count: ${count}`)
    } catch (e: any) {
        console.error(`[${name}] FAILED.`)
        console.error('Error code:', e.code)
        console.error('Error message:', e.message)
    } finally {
        await client.$disconnect()
    }
}

async function main() {
    await testConnection(process.env.DATABASE_URL, 'DATABASE_URL')
    await testConnection(process.env.DIRECT_URL, 'DIRECT_URL')
}

main()
