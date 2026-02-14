const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Connecting to database...');
    try {
        const start = Date.now();
        const count = await prisma.user.count();
        const duration = Date.now() - start;
        console.log(`✅ Successfully connected in ${duration}ms`);
        console.log(`User count: ${count}`);
    } catch (e) {
        console.error('❌ Connection failed:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
