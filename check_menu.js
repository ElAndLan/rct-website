
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { order: 'asc' },
    });
    console.log(JSON.stringify(items, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
