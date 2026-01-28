"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addMinutes, format } from "date-fns";

// --- Event Management ---

export async function getAuditionEvents() {
  try {
    return await prisma.auditionEvent.findMany({
      orderBy: { startDate: "desc" },
      include: {
        _count: {
          select: { slots: true },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch audition events:", error);
    return [];
  }
}

export async function createAuditionEvent(formData: FormData) {
  const title = formData.get("title") as string;
  const location = formData.get("location") as string;
  const startDate = new Date(formData.get("startDate") as string);
  const endDate = new Date(formData.get("endDate") as string);
  const description = formData.get("description") as string;

  const event = await prisma.auditionEvent.create({
    data: {
      title,
      location,
      startDate,
      endDate,
      description,
      isActive: true,
    },
  });

  revalidatePath("/admin/auditions");
  redirect(`/admin/auditions/${event.id}`); // Redirect to slot manager
}

// --- Slot Management ---

export async function getAuditionSlots(eventId: string) {
  try {
    return await prisma.auditionSlot.findMany({
      where: { auditionEventId: eventId },
      orderBy: { startTime: "asc" },
      include: {
        signups: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch audition slots:", error);
    return [];
  }
}

export async function generateSlots(eventId: string, formData: FormData) {
  const startTimeStr = formData.get("startTime") as string; // "09:00"
  const endTimeStr = formData.get("endTime") as string; // "17:00"
  const dateStr = formData.get("date") as string; // "2024-10-15"
  const duration = parseInt(formData.get("duration") as string) || 30; // minutes
  const capacity = parseInt(formData.get("capacity") as string) || 1;

  // Parse Date
  const baseDate = new Date(dateStr);

  // Parse Start Time
  const [startHour, startMinute] = startTimeStr.split(":").map(Number);
  let currentTime = new Date(baseDate);
  currentTime.setHours(startHour, startMinute, 0, 0);

  // Parse End Time
  const [endHour, endMinute] = endTimeStr.split(":").map(Number);
  const endTime = new Date(baseDate);
  endTime.setHours(endHour, endMinute, 0, 0);

  const newSlots = [];

  while (currentTime < endTime) {
    const slotEnd = addMinutes(currentTime, duration);

    // Don't go past the end time
    if (slotEnd > endTime) break;

    newSlots.push({
      auditionEventId: eventId,
      startTime: new Date(currentTime),
      endTime: new Date(slotEnd),
      capacity,
    });

    currentTime = slotEnd;
  }

  await prisma.auditionSlot.createMany({
    data: newSlots,
  });

  revalidatePath(`/admin/auditions/${eventId}`);
}

export async function deleteSlot(slotId: string) {
  await prisma.auditionSlot.delete({ where: { id: slotId } });
  revalidatePath("/admin/auditions/[id]");
}
