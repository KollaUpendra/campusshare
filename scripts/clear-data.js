const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up payment requests...");
  const deleted = await prisma.depositRequest.deleteMany({});
  console.log(`Successfully deleted ${deleted.count} requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
