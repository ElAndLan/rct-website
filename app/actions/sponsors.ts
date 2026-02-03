"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { processAndSaveImage } from "./media";

// --- Schemas ---

const SponsorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  websiteUrl: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});

// --- Helper Functions ---

async function saveFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return processAndSaveImage(buffer, file.name);
}

async function processImageUpload(
  formData: FormData,
  fieldName: string,
): Promise<string | undefined> {
  const file = formData.get(fieldName) as File;
  const urlInput = formData.get(`${fieldName}_url`) as string;
  const existing = formData.get(`${fieldName}_existing`) as string;

  if (file && file.size > 0) {
    return await saveFile(file);
  } else if (urlInput) {
    return urlInput;
  } else if (existing) {
    return existing;
  }
  return undefined;
}

// --- Fetch Actions ---

export async function getSponsors() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return sponsors;
  } catch (error) {
    console.error("Failed to fetch sponsors:", error);
    return [];
  }
}

export async function getActiveSponsors() {
    try {
      const sponsors = await prisma.sponsor.findMany({
        where: { isActive: true },
        orderBy: {
          order: "asc",
        },
      });
      return sponsors;
    } catch (error) {
      console.error("Failed to fetch active sponsors:", error);
      return [];
    }
  }

export async function getSponsorById(id: string) {
  try {
    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
    });
    return sponsor;
  } catch (error) {
    console.error(`Failed to fetch sponsor ${id}:`, error);
    return null;
  }
}

// --- Mutation Actions ---

export async function createSponsor(formData: FormData) {
  try {
    const imageUrl = await processImageUpload(formData, "image");

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      websiteUrl: formData.get("websiteUrl"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      isActive: formData.get("isActive") === "true",
      order: formData.get("order") ? parseInt(formData.get("order") as string) : 0,
      imageUrl,
    };

    const validatedData = SponsorSchema.parse(rawData);

    await prisma.sponsor.create({
      data: validatedData,
    });

    revalidatePath("/admin/sponsors");
    revalidatePath("/sponsors");
    return { success: true };
  } catch (error) {
    console.error("Failed to create sponsor:", error);
    return { success: false, error: "Failed to create sponsor" };
  }
}

export async function updateSponsor(id: string, formData: FormData) {
  try {
    const imageUrl = await processImageUpload(formData, "image");

    const rawData = {
      name: formData.get("name"),
      description: formData.get("description"),
      websiteUrl: formData.get("websiteUrl"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      isActive: formData.get("isActive") === "true",
      order: formData.get("order") ? parseInt(formData.get("order") as string) : 0,
      imageUrl,
    };

    const validatedData = SponsorSchema.parse(rawData);

    await prisma.sponsor.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/admin/sponsors");
    revalidatePath("/sponsors");
    return { success: true };
  } catch (error) {
    console.error("Failed to update sponsor:", error);
    return { success: false, error: "Failed to update sponsor" };
  }
}

export async function deleteSponsor(id: string) {
  try {
    await prisma.sponsor.delete({
      where: { id },
    });

    revalidatePath("/admin/sponsors");
    revalidatePath("/sponsors");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete sponsor:", error);
    return { success: false, error: "Failed to delete sponsor" };
  }
}

export async function updateSponsorOrder(items: { id: string; order: number }[]) {
    try {
        await prisma.$transaction(
            items.map((item) =>
                prisma.sponsor.update({
                    where: { id: item.id },
                    data: { order: item.order },
                })
            )
        );
        revalidatePath("/admin/sponsors");
        revalidatePath("/sponsors");
        return { success: true };
    } catch (error) {
        console.error("Failed to update sponsor order:", error);
        return { success: false, error: "Failed to update sponsor order" };
    }
}
