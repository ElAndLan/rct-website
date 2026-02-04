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
    revalidatePath(`/admin/auditions/${showId}`);
    revalidateTag("auditions", "max");
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

    revalidatePath(`/admin/auditions`);
    // We can't easily revalidate the specific show page without passing showId,
    // but usually the auditionId is not the showId.
    // However, the admin page is /admin/auditions/[showId].
    // We can fetch the showId from auditionId if we really need to be precise,
    // or just revalidate the layout.
    revalidateTag("auditions", "max");

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
    revalidatePath("/admin/auditions");
    return { success: true };
  } catch (error) {
    console.error("Error deleting slot:", error);
    return { success: false, error: "Failed to delete slot" };
  }
}

export async function cancelAuditionBooking(attendeeId: string) {
  try {
    const attendee = await prisma.auditionAttendee.delete({
      where: { id: attendeeId },
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
    });

    // Revalidate paths
    revalidatePath("/admin/auditions");
    if (attendee.slot?.audition?.show?.slug) {
      revalidatePath(`/auditions/${attendee.slot.audition.show.slug}`);
    }
    revalidateTag("auditions", "max");

    return { success: true, attendee };
  } catch (error) {
    console.error("Error canceling booking:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}

// --- Public Actions ---

export async function bookAuditionSlot(data: z.infer<typeof BookingSchema>) {
  try {
    const validated = BookingSchema.parse(data);

    // Use transaction to ensure capacity integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Slot with current attendees count
      const slot = await tx.auditionSlot.findUnique({
        where: { id: validated.slotId },
        include: {
          attendees: true,
          audition: {
            include: {
              show: true,
            },
          },
        },
      });

      if (!slot) {
        throw new Error("Audition slot not found");
      }

      if (slot.attendees.length >= slot.capacity) {
        throw new Error("This time slot is already full");
      }

      // 2. Create Attendee
      const attendee = await tx.auditionAttendee.create({
        data: {
          slotId: validated.slotId,
          fullName: validated.fullName,
          email: validated.email,
          phoneNumber: validated.phoneNumber,
          desiredRole: validated.desiredRole,
        },
      });

      return { attendee, slot };
    });

    const { attendee, slot } = result;
    const show = slot.audition.show;

    // 3. Send Emails (Fire and forget, or await?)
    // Best to await to ensure delivery, or at least log errors.

    // Email to Applicant
    if (attendee.email) {
      await sendEmail({
        to: attendee.email,
        subject: `Audition Confirmed: ${show.title}`,
        html: `
          <h1>Audition Confirmation</h1>
          <p>Hi ${attendee.fullName},</p>
          <p>You are confirmed for an audition for <strong>${show.title}</strong>.</p>
          <p><strong>Time:</strong> ${format(slot.startTime, "MMMM do, yyyy 'at' h:mm a")}</p>
          <p><strong>Location:</strong> ${slot.audition.location || "TBD"}</p>
          ${slot.audition.description ? `<p><strong>Notes:</strong> ${slot.audition.description}</p>` : ""}
          <p>Good luck!</p>
        `,
      });
    }

    // Email to Theatre Admin
    const theatreEmail = process.env.THEATRE_EMAIL || "admin@example.com";
    await sendEmail({
      to: theatreEmail,
      subject: `New Audition Signup: ${show.title}`,
      html: `
        <h2>New Audition Signup</h2>
        <p><strong>Show:</strong> ${show.title}</p>
        <p><strong>Name:</strong> ${attendee.fullName}</p>
        <p><strong>Role:</strong> ${attendee.desiredRole || "N/A"}</p>
        <p><strong>Time:</strong> ${format(slot.startTime, "MMMM do, yyyy 'at' h:mm a")}</p>
        <p><strong>Contact:</strong> ${attendee.email || ""} ${attendee.phoneNumber || ""}</p>
      `,
    });

    revalidatePath(`/auditions/${show.slug}`);
    revalidatePath(`/admin/auditions/${show.id}`);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Invalid input data",
      };
    }
    console.error("Error booking audition:", error);
    return {
      success: false,
      error: (error as Error).message || "Failed to book audition",
    };
  }
}
