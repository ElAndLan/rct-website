"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/mail";

// --- Types ---

export type SeatStatus = "AVAILABLE" | "SOLD" | "HELD";

export interface SeatWithStatus {
  id: string;
  row: string;
  number: number;
  category: string;
  status: SeatStatus;
  price: number;
}

// --- Fetch Actions ---

export async function getShowPerformances(slug: string) {
  try {
    const show = await prisma.show.findUnique({
      where: { slug },
      include: {
        performances: {
          orderBy: { date: "asc" },
        },
      },
    });
    return show;
  } catch (error) {
    console.error("Failed to fetch show performances:", error);
    return null;
  }
}

export async function getPerformanceDetails(performanceId: string) {
  try {
    const performance = await prisma.showPerformance.findUnique({
      where: { id: performanceId },
      include: {
        show: true,
      },
    });

    if (!performance) return null;

    // Fetch all seats
    const allSeats = await prisma.seat.findMany({
      orderBy: [{ row: "asc" }, { number: "asc" }],
    });

    // Fetch sold tickets for this performance
    const soldTickets = await prisma.ticket.findMany({
      where: {
        performanceId,
        status: "SOLD",
      },
      select: { seatId: true },
    });

    const soldSeatIds = new Set(soldTickets.map((t) => t.seatId));

    // Combine into SeatWithStatus
    const seats: SeatWithStatus[] = allSeats.map((seat) => ({
      id: seat.id,
      row: seat.row,
      number: seat.number,
      category: seat.category,
      status: soldSeatIds.has(seat.id) ? "SOLD" : "AVAILABLE",
      price: Number(performance.show.ticketPrice || 0),
    }));

    return {
      performance,
      seats,
    };
  } catch (error) {
    console.error("Failed to fetch performance details:", error);
    return null;
  }
}

// --- Transaction Actions ---

export async function createOrder(
  performanceId: string,
  seatIds: string[],
  customer: { name: string; email: string; phone: string; last4: string },
) {
  // 1. Validate input
  if (!seatIds.length) {
    return { success: false, error: "No seats selected" };
  }

  // 2. Start Transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check if seats are still available
      const existingTickets = await tx.ticket.findMany({
        where: {
          performanceId,
          seatId: { in: seatIds },
          status: "SOLD",
        },
      });

      if (existingTickets.length > 0) {
        throw new Error("One or more selected seats have just been sold.");
      }

      // Fetch price
      const performance = await tx.showPerformance.findUnique({
        where: { id: performanceId },
        include: { show: true },
      });

      if (!performance) throw new Error("Performance not found");

      // Fetch seat details for email
      const seats = await tx.seat.findMany({
        where: { id: { in: seatIds } },
      });

      const pricePerSeat = Number(performance.show.ticketPrice || 0);
      const subtotal = pricePerSeat * seatIds.length;
      const tax = subtotal * 0.06; // 6% PA Tax
      const totalAmount = subtotal + tax;

      // Create Order
      const order = await tx.order.create({
        data: {
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone,
          totalAmount,
          status: "PAID", // Simulating immediate success
          paymentIntentId: `sim_${Math.random().toString(36).substring(7)}`,
          last4: customer.last4,
        },
      });

      // Create Tickets
      await tx.ticket.createMany({
        data: seatIds.map((seatId) => ({
          performanceId,
          seatId,
          orderId: order.id,
          status: "SOLD",
          pricePaid: pricePerSeat,
        })),
      });

      return { order, performance, seats };
    });

    // 3. Send Email (After transaction commits)
    const { order, performance, seats } = result;

    // Invalidate cache for this performance
    revalidateTag("tickets", "max");

    const dateStr = new Date(performance.date).toLocaleString();

    const emailHtml = `
      <div style="font-family: sans-serif; max-w-600px; margin: 0 auto;">
        <h1>Order Confirmation</h1>
        <p>Hi ${order.customerName},</p>
        <p>Thank you for your purchase! Here is your receipt.</p>
        
        <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order #:</strong> ${order.id.slice(-8).toUpperCase()}</p>
          <p><strong>Total Paid:</strong> $${Number(order.totalAmount).toFixed(2)}</p>
          <p><strong>Card:</strong> **** **** **** ${order.last4 || "****"}</p>
        </div>

        <h2>Your Tickets</h2>
        <p><strong>Show:</strong> ${performance.show.title}</p>
        <p><strong>Date:</strong> ${dateStr}</p>
        
        <ul style="list-style: none; padding: 0;">
          ${seats
            .map(
              (seat) => `
            <li style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px;">
              <strong>Row ${seat.row} - Seat ${seat.number}</strong> (${seat.category})
            </li>
          `,
            )
            .join("")}
        </ul>

        <p>Please present this email at the box office.</p>
      </div>
    `;

    await sendEmail({
      to: customer.email,
      subject: `Your Tickets for ${performance.show.title}`,
      html: emailHtml,
    });

    return { success: true, orderId: result.order.id };
  } catch (error: any) {
    console.error("Order failed:", error);
    return { success: false, error: error.message || "Transaction failed" };
  }
}

export async function getOrder(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
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
}
