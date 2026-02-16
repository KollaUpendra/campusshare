
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to connect to database...");
    await prisma.$connect();
    console.log("Connection successful!");
    
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
