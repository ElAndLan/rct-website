"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getAdminEmails } from "./users";

export async function signupForAudition(formData: FormData) {
  const slotId = formData.get("slotId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const notes = formData.get("notes") as string;

  // 1. Verify Slot Capacity
  const slot = await prisma.auditionSlot.findUnique({
    where: { id: slotId },
    include: { signups: true, event: true },
  });

  if (!slot) throw new Error("Slot not found");

  if (slot.signups.length >= slot.capacity) {
    throw new Error("This slot is already full.");
  }

  // 2. Create Signup
  await prisma.auditionSignup.create({
    data: {
      auditionSlotId: slotId,
      name,
      email,
      phone,
      notes,
    },
  });

  // 3. Send Email Notification
  // Notify User
  console.log(`
  ------------------------------------
  EMAIL TO: ${email}
  SUBJECT: Audition Confirmation: ${slot.event.title}
  
  You are signed up for ${slot.startTime.toLocaleString()}
  ------------------------------------
  `)

  // Notify Admins
  const adminEmails = await getAdminEmails()
  console.log(`
  ------------------------------------
  EMAIL TO: ${adminEmails.join(", ")}
  SUBJECT: New Audition Signup for ${slot.event.title}
  
  Name: ${name}
  Time: ${slot.startTime.toLocaleString()}
  ------------------------------------
  `)

  revalidatePath(`/auditions`);
  redirect(`/auditions/confirmation`);
}
