
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to fetch user with new fields...");
    // Just try to find any user and select the new fields
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        coins: true,
        bio: true,
        phoneNumber: true,
        sentTransactions: true
      }
    });
    console.log("Successfully queried user fields:", user);
    
    console.log("Attempting to fetch item with new fields...");
    const item = await prisma.item.findFirst({
        select: {
            images: true,
            category: true,
            type: true
        }
    });
    console.log("Successfully queried item fields:", item);

  } catch (e) {
    console.error("Error querying database:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
