
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const items = await prisma.item.findMany({
        where: {
            title: { contains: 'book', mode: 'insensitive' }
        }
    });

    console.log("Found items:", items.length);
    items.forEach(item => {
        console.log(JSON.stringify(item, null, 2));
    });

    const settings = await prisma.systemSettings.findFirst();
    console.log("System Settings:", JSON.stringify(settings, null, 2));
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
