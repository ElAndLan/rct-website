"use server";

import prisma from "@/lib/prisma";

export type DashboardMessage = {
  id: string;
  type: "CONTACT" | "VOLUNTEER" | "MEMBERSHIP";
  name: string;
  email: string | null;
  subject: string;
  preview: string;
  date: Date;
  details: any;
};

export type DashboardActivity = {
  id: string;
  type: "TICKET" | "AUDITION";
  description: string;
  date: Date;
};

export type DashboardMetrics = {
  ticketsSold: number;
  auditionSignups: number;
  totalMessages: number;
};

export async function getAdminDashboardData() {
  try {
    // 1. Fetch Messages (Contact & Volunteer)
    const [contactSubmissions, volunteerApplications, membershipApplications] =
      await Promise.all([
        prisma.contactSubmission.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.volunteerApplication.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.membershipApplication.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      ]);

    // Normalize and combine messages
    const messages: DashboardMessage[] = [
      ...contactSubmissions.map((c) => ({
        id: c.id,
        type: "CONTACT" as const,
        name: c.name,
        email: c.email,
        subject: c.subject,
        preview:
          c.message.substring(0, 100) + (c.message.length > 100 ? "..." : ""),
        date: c.createdAt,
        details: c,
      })),
      ...volunteerApplications.map((v) => ({
        id: v.id,
        type: "VOLUNTEER" as const,
        name: v.fullName,
        email: v.email,
        subject: `Volunteer Application: ${v.roles.join(", ")}`,
        preview: v.about
          ? v.about.substring(0, 100) + "..."
          : "No details provided",
        date: v.createdAt,
        details: v,
      })),
      ...membershipApplications.map((m) => {
        let parsedFamilyMembers = [];
        if (m.familyMembers) {
          try {
            parsedFamilyMembers = JSON.parse(m.familyMembers);
          } catch (e) {
            console.error("Failed to parse family members", e);
          }
        }

        return {
          id: m.id,
          type: "MEMBERSHIP" as const,
          name: `${m.firstName} ${m.lastName}`,
          email: m.email,
          subject: `Membership Application: ${m.tier}`,
          preview: `Amount: $${m.amount} | Status: ${m.status || "Pending"}`,
          date: m.createdAt,
          details: {
            ...m,
            familyMembers: parsedFamilyMembers,
          },
        };
      }),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // 2. Fetch Recent Activity
    const [recentTickets, recentAuditions] = await Promise.all([
      prisma.ticket.findMany({
        where: { status: "SOLD" },
        include: {
          performance: {
            include: {
              show: true,
            },
          },
          seat: true,
          order: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.auditionAttendee.findMany({
        include: {
          slot: {
            include: {
              audition: {
                include: {
                  show: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const activity: DashboardActivity[] = [
      ...recentTickets.map((t) => ({
        id: t.id,
        type: "TICKET" as const,
        description: `Ticket sold for ${t.performance.show.title} (Seat ${t.seat.row}${t.seat.number}) to ${t.order?.customerName || "Unknown"}`,
        date: t.createdAt,
      })),
      ...recentAuditions.map((a) => ({
        id: a.id,
        type: "AUDITION" as const,
        description: `${a.fullName} signed up for ${a.slot.audition.show.title}`,
        date: a.createdAt,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // 3. Fetch Metrics
    const [ticketsSold, auditionSignups] = await Promise.all([
      prisma.ticket.count({ where: { status: "SOLD" } }),
      prisma.auditionAttendee.count(),
    ]);

    return {
      messages,
      activity,
      metrics: {
        ticketsSold,
        auditionSignups,
        totalMessages: messages.length,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    return {
      messages: [],
      activity: [],
      metrics: { ticketsSold: 0, auditionSignups: 0, totalMessages: 0 },
    };
  }
}
