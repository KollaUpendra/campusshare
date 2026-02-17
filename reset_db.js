
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database reset...');
  try {
    // 1. Delete Transactions
    const deletedTxns = await prisma.transaction.deleteMany();
    console.log(`Deleted ${deletedTxns.count} transactions.`);
    
    // 2. Delete Bookings (This clears the specific logic flows)
    const deletedBookings = await prisma.booking.deleteMany();
    console.log(`Deleted ${deletedBookings.count} bookings.`);
    
    // 3. Reset Item Statuses to 'active' (Unstuck items)
    const updatedItems = await prisma.item.updateMany({
        where: { status: { not: 'active' } },
        data: { status: 'active' }
    });
    console.log(`Reset ${updatedItems.count} items to 'active'.`);
    
    // 4. Delete Admin Action Logs (Optional, but good for clean slate)
    // const deletedLogs = await prisma.adminActionLog.deleteMany();
    // console.log(`Deleted ${deletedLogs.count} admin logs.`);

  } catch (e) {
    console.error('Error resetting database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
