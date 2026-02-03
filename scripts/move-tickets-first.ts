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
      data: { order: -1 },
    });
    console.log("Updated Ticket Order to -1");
  } else {
    console.log("Ticket item not found");
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
