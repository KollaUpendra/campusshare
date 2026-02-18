
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Setting all users coins to 200...');
  try {
    const updatedUsers = await prisma.user.updateMany({
        data: { coins: 200 }
    });
    console.log(`Updated ${updatedUsers.count} users.`);
  } catch (e) {
    console.error('Error updating coins:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
