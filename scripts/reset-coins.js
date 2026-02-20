const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Resetting all users' coins to 200...");
  const result = await prisma.user.updateMany({
    data: {
      coins: 200.0,
    },
  });
  console.log(`Successfully updated ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
