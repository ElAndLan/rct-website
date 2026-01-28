"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Mock Email Service
async function sendWelcomeEmail(email: string, password: string) {
  console.log(`
    ========================================
    MOCK EMAIL TO: ${email}
    SUBJECT: Welcome to River City Theatre Admin
    
    You have been invited to the RCT Admin Portal.
    
    Login: ${email}
    Password: ${password}
    
    Please login at /api/auth/signin
    ========================================
    `);
}

const UserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "USER"]).default("USER"),
});

export async function createUser(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  };

  const result = UserSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { name, email, role } = result.data;

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { success: false, error: "User already exists" };
  }

  // Generate random password
  const password = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    await sendWelcomeEmail(email, password);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUsers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function getAdminEmails() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { email: true },
    });
    return admins.map((u) => u.email).filter(Boolean) as string[];
  } catch (error) {
    return [];
  }
}
