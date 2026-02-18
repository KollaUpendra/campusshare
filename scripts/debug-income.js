
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Analyzing Total Income...");
  
  const transactions = await prisma.transaction.findMany({
    where: {
      platformFee: {
        gt: 0
      }
    },
    include: {
      item: {
        select: { title: true }
      },
      fromUser: {
        select: { name: true }
      }
    }
  });

  console.log(`Found ${transactions.length} transactions with fees.`);
  
  let total = 0;
  transactions.forEach(t => {
    console.log(`- Item: ${t.item?.title || 'Unknown'} | Type: ${t.type} | Amount: ${t.amount} | Fee: ${t.platformFee}`);
    total += t.platformFee;
  });

  console.log(`\nTotal Calculated Income: ${total}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
