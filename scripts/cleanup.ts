import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const deleted = await prisma.item.deleteMany({});
    console.log(`Deleted ${deleted.count} items.`);
  } catch (error) {
    console.error('Error deleting items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
