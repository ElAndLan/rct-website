"use server";

import prisma from "@/lib/prisma";

export async function getAllOrders() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tickets: {
          include: {
            seat: true,
            performance: {
              include: {
                show: true,
              },
            },
          },
        },
      },
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}
