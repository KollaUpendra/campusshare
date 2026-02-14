import { PrismaClient } from '@prisma/client'

const REQUIRED_VARS = [
    'DATABASE_URL',
    'DIRECT_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'ALLOWED_DOMAIN'
]

async function testConnection(url: string | undefined, name: string) {
    if (!url) {
        console.log(`[${name}] ❌ MISSING`)
        return false
    }

    const client = new PrismaClient({
        datasources: {
            db: {
                url: url,
            },
        },
    })

    try {
        await client.$connect()
        await client.user.count()
        console.log(`[${name}] ✅ VALID (Connection succeeded)`)
        await client.$disconnect()
        return true
    } catch (e: any) {
        console.log(`[${name}] ❌ INVALID (Connection failed: ${e.message.split('\n')[0]})`)
        await client.$disconnect()
        return false
    }
}

async function verifyEnv() {
    console.log('------------------------------------------------')
    console.log('VERIFYING ENVIRONMENT VARIABLES')
    console.log('------------------------------------------------')

    let allValid = true

    // 1. Check Presence
    for (const key of REQUIRED_VARS) {
        const value = process.env[key]
        if (!value) {
            console.log(`[${key}] ❌ MISSING`)
            allValid = false
        } else {
            // Basic Checks
            if (key === 'GOOGLE_CLIENT_ID') {
                if (!value.endsWith('.apps.googleusercontent.com')) {
                    console.log(`[${key}] ⚠️ WARNING: Does not look like a standard Google Client ID`)
                } else {
                    console.log(`[${key}] ✅ PRESENT (Format looks correct)`)
                }
            } else if (key === 'NEXTAUTH_URL') {
                try {
                    new URL(value)
                    console.log(`[${key}] ✅ VALID (Valid URL format)`)
                } catch {
                    console.log(`[${key}] ❌ INVALID (Not a valid URL)`)
                    allValid = false
                }
            } else if (key === 'DATABASE_URL' || key === 'DIRECT_URL') {
                // Will be tested in step 2
                console.log(`[${key}] ⏳ Pending Connection Test...`)
            } else {
                console.log(`[${key}] ✅ PRESENT`)
            }
        }
    }

    console.log('\n------------------------------------------------')
    console.log('TESTING DATABASE CONNECTIONS')
    console.log('------------------------------------------------')

    // 2. Test Connections
    const dbValid = await testConnection(process.env.DATABASE_URL, 'DATABASE_URL')
    const directValid = await testConnection(process.env.DIRECT_URL, 'DIRECT_URL')

    if (!dbValid || !directValid) allValid = false

    console.log('\n------------------------------------------------')
    if (allValid) {
        console.log('OVERALL STATUS: ✅ ALL CHECKS PASSED')
    } else {
        console.log('OVERALL STATUS: ❌ SOME CHECKS FAILED')
    }
    console.log('------------------------------------------------')
}

verifyEnv()
