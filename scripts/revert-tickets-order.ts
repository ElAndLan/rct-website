import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const ticketItem = await prisma.menuItem.findFirst({
    where: { label: "Tickets" },
  });

  if (ticketItem) {
    console.log("Current Ticket Order:", ticketItem.order);
    await prisma.menuItem.update({
      where: { id: ticketItem.id },
      data: { order: 5 },
    });
    console.log("Reverted Ticket Order to 5");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
