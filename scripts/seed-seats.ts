
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSeats() {
  console.log('Seeding seats...');

  // Clear existing seats to avoid duplicates if re-run
  await prisma.seat.deleteMany();

  const seats = [];

  // Rows A & B: 19 seats
  for (const row of ['A', 'B']) {
    for (let i = 1; i <= 19; i++) {
      seats.push({ row, number: i, category: 'STANDARD' });
    }
  }

  // Row C: 13 seats
  // HC Seats: C3, C4, C6, C7, C8, C11
  const hcSeats = [3, 4, 6, 7, 8, 11];
  for (let i = 1; i <= 13; i++) {
    const isHc = hcSeats.includes(i);
    seats.push({ 
      row: 'C', 
      number: i, 
      category: isHc ? 'ACCESSIBLE' : 'STANDARD' 
    });
  }

  // Rows D - I: 16 seats
  const midRows = ['D', 'E', 'F', 'G', 'H', 'I'];
  for (const row of midRows) {
    for (let i = 1; i <= 16; i++) {
      seats.push({ row, number: i, category: 'STANDARD' });
    }
  }

  // Rows J - K: 12 seats (Sound Booth takes 4 spots on left)
  // We will store them as 1-12, but frontend will render them offset
  for (const row of ['J', 'K']) {
    for (let i = 1; i <= 12; i++) {
      seats.push({ row, number: i, category: 'STANDARD' });
    }
  }

  console.log(`Prepared ${seats.length} seats.`);

  // Batch insert
  await prisma.seat.createMany({
    data: seats,
  });

  console.log('Seats seeded successfully.');
}

seedSeats()
  .catch((e) => {
    console.error('Error seeding seats:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
