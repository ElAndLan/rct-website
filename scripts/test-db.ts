import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    const count = await prisma.user.count()
    console.log("Connection successful. User count:", count)
  } catch (e) {
    console.error("Connection failed:", e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()