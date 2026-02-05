"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";
import { addMinutes, format, parse } from "date-fns";
import { sendEmail } from "@/lib/mail";

// --- Schemas ---

const AuditionSettingsSchema = z.object({
  description: z.string().optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

const GenerateSlotsSchema = z.object({
  auditionId: z.string(),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(), // HH:mm
  endTime: z.string(), // HH:mm
  slotDuration: z.number().min(5).default(30),
  capacity: z.number().min(1).default(1),
});

const BookingSchema = z
  .object({
    slotId: z.string(),
    fullName: z.string().min(1, "Name is required"),
    email: z.string().email().optional().or(z.literal("")),
    phoneNumber: z.string().optional().or(z.literal("")),
    desiredRole: z.string().optional(),
  })
  .refine((data) => data.email || data.phoneNumber, {
    message: "Either email or phone number is required",
    path: ["email"],
  });

// --- Fetch Actions ---

export const getPublicAuditions = unstable_cache(
  async () => {
    try {
      const showsWithAuditions = await prisma.show.findMany({
        where: {
          audition: {
            isActive: true,
          },
        },
        include: {
          audition: {
            include: {
              slots: true,
            },
          },
        },
        orderBy: {
          startDate: "asc",
        },
      });
      return showsWithAuditions;
    } catch (error) {
      console.error("Failed to fetch public auditions:", error);
      return [];
    }
  },
  ["public-auditions"],
  { tags: ["auditions"] },
);

export const getAuditionBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const show = await prisma.show.findUnique({
        where: { slug },
        include: {
          audition: {
            include: {
              slots: {
                include: {
                  _count: {
                    select: { attendees: true },
                  },
                },
                orderBy: {
                  startTime: "asc",
                },
              },
            },
          },
        },
      });
      return show;
    } catch (error) {
      console.error("Failed to fetch audition by slug:", error);
      return null;
    }
  },
  ["audition-by-slug"],
  { tags: ["auditions"] },
);

// --- Admin Actions ---

export async function upsertAudition(
  showId: string,
  data: z.infer<typeof AuditionSettingsSchema>,
) {
  try {
    const audition = await prisma.audition.upsert({
      where: { showId },
      create: {
        showId,
        description: data.description,
        location: data.location,
        isActive: data.isActive,
      },
      update: {
        description: data.description,
        location: data.location,
        isActive: data.isActive,
      },
    });
    // We revalidate everything since we are moving to client components
    revalidateTag("auditions");
    return { success: true, audition };
  } catch (error) {
    console.error("Error upserting audition:", error);
    return { success: false, error: "Failed to save audition settings" };
  }
}

export async function generateAuditionSlots(
  data: z.infer<typeof GenerateSlotsSchema>,
) {
  try {
    const { auditionId, date, startTime, endTime, slotDuration, capacity } =
      data;

    // Parse base date (YYYY-MM-DD)
    const baseDate = new Date(date);
    // Ensure we are working with the start of that day in local time or UTC?
    // Using date string "YYYY-MM-DD" + "T" + "HH:mm" is safer.

    // Construct full ISO strings to avoid timezone issues where possible,
    // but date-fns parse is good.
    const startDateTimeStr = `${date}T${startTime}`;
    const endDateTimeStr = `${date}T${endTime}`;

    const startParsed = new Date(startDateTimeStr);
    const endParsed = new Date(endDateTimeStr);

    const slotsData = [];
    let current = startParsed;

    while (current < endParsed) {
      const next = addMinutes(current, slotDuration);
      if (next > endParsed) break;

      slotsData.push({
        auditionId,
        startTime: current,
        endTime: next,
        capacity,
      });

      current = next;
    }

    if (slotsData.length > 0) {
      await prisma.auditionSlot.createMany({
        data: slotsData,
      });
    }

    revalidateTag("auditions");

    return { success: true, count: slotsData.length };
  } catch (error) {
    console.error("Error generating slots:", error);
    return { success: false, error: "Failed to generate slots" };
  }
}

export async function deleteAuditionSlot(slotId: string) {
  try {
    await prisma.auditionSlot.delete({
      where: { id: slotId },
    });
    revalidateTag("auditions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting slot:", error);
    return { success: false, error: "Failed to delete slot" };
  }
}

export async function cancelAuditionBooking(attendeeId: string) {
  try {
    await prisma.auditionAttendee.delete({
        where: { id: attendeeId }
    });
    revalidateTag("auditions");
    return { success: true };
  } catch (error) {
      console.error("Error cancelling booking:", error);
      return { success: false, error: "Failed to cancel booking" };
  }
}

export async function getAdminAuditionShows() {
  try {
    return await prisma.show.findMany({
      include: {
        audition: {
          include: {
            _count: {
              select: { slots: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch admin audition shows:", error);
    return [];
  }
}

export async function getAdminAuditionDetails(showId: string) {
  try {
    return await prisma.show.findUnique({
      where: { id: showId },
      include: {
        audition: {
          include: {
            slots: {
              include: {
                attendees: true,
                _count: {
                  select: { attendees: true },
                },
              },
              orderBy: {
                startTime: 'asc',
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin audition details:", error);
    return null;
  }
}

export type AdminAuditionShow = Awaited<ReturnType<typeof getAdminAuditionShows>>[number];
export type AdminAuditionDetails = NonNullable<Awaited<ReturnType<typeof getAdminAuditionDetails>>>;

export async function bookAuditionSlot(data: z.infer<typeof BookingSchema>) {
  try {
    const result = BookingSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Invalid data" };
    }

    const { slotId, fullName, email, phoneNumber, desiredRole } = result.data;

    const slot = await prisma.auditionSlot.findUnique({
      where: { id: slotId },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    });

    if (!slot) {
      return { success: false, error: "Slot not found" };
    }

    if (slot._count.attendees >= slot.capacity) {
      return { success: false, error: "Slot is full" };
    }

    const attendee = await prisma.auditionAttendee.create({
      data: {
        slotId,
        fullName,
        email: email || null,
        phoneNumber: phoneNumber || null,
        desiredRole: desiredRole || null,
      },
    });

    revalidateTag("auditions");
    return { success: true, attendee };
  } catch (error) {
    console.error("Error booking slot:", error);
    return { success: false, error: "Failed to book slot" };
  }
}
