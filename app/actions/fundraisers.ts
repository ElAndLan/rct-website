"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

// --- Schemas ---

const FundraiserSchema = z.object({
  title: z.string().min(1, "Title is required"),
  shortDescription: z.string().min(1, "Short description is required"),
  description: z.string().min(1, "Description is required"),
  locationName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  events: z
    .array(
      z.object({
        startTime: z.string(), // ISO string
        endTime: z.string().optional(), // ISO string
      }),
    )
    .optional(),
});

// --- Types ---
export type FundraiserWithEvents = Awaited<
  ReturnType<typeof getFundraiserById>
>;

// --- Helper Functions ---

async function saveFile(file: File): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const filename = `${randomUUID()}-${file.name}`;
    const blob = await put(filename, file, { access: "public" });
    return blob.url;
  }

  const filename = `${randomUUID()}${path.extname(file.name)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // ignore
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
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

export async function getFundraisers() {
  try {
    const fundraisers = await prisma.fundraiser.findMany({
      include: {
        events: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return fundraisers;
  } catch (error) {
    console.error("Failed to fetch fundraisers:", error);
    return [];
  }
}

export async function getFundraiserById(id: string) {
  try {
    const fundraiser = await prisma.fundraiser.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });
    return fundraiser;
  } catch (error) {
    console.error(`Failed to fetch fundraiser ${id}:`, error);
    return null;
  }
}

export async function getFundraiserBySlug(slug: string) {
  try {
    const fundraiser = await prisma.fundraiser.findUnique({
      where: { slug },
      include: {
        events: {
          orderBy: {
            startTime: "asc",
          },
        },
      },
    });
    return fundraiser;
  } catch (error) {
    console.error(`Failed to fetch fundraiser ${slug}:`, error);
    return null;
  }
}

// --- Mutation Actions ---

export async function createFundraiser(formData: FormData) {
  // Process Image
  const imageUrl = await processImageUpload(formData, "image");

  const rawData: Record<string, any> = {
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    locationName: formData.get("locationName"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    imageUrl: imageUrl, // Use processed URL
    isActive: formData.get("isActive") === "true",
  };

  // Process events from JSON string if present
  const eventsJson = formData.get("events") as string;
  if (eventsJson) {
    try {
      rawData.events = JSON.parse(eventsJson);
    } catch (e) {
      console.error("Failed to parse events JSON", e);
    }
  }

  // Generate slug
  const slug =
    rawData.title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]/g, "") +
    "-" +
    new Date().getFullYear();

  try {
    await prisma.fundraiser.create({
      data: {
        title: rawData.title,
        slug,
        shortDescription: rawData.shortDescription,
        description: rawData.description,
        locationName: rawData.locationName,
        address: rawData.address,
        city: rawData.city,
        state: rawData.state,
        zip: rawData.zip,
        imageUrl: rawData.imageUrl,
        isActive: rawData.isActive,
        events: {
          create:
            rawData.events?.map((e: any) => ({
              startTime: new Date(e.startTime),
              endTime: e.endTime ? new Date(e.endTime) : null,
            })) || [],
        },
      },
    });
  } catch (error) {
    console.error("Failed to create fundraiser:", error);
    throw new Error("Failed to create fundraiser");
  }

  revalidatePath("/admin/fundraisers");
  revalidatePath("/fundraisers");
  redirect("/admin/fundraisers");
}

export async function updateFundraiser(id: string, formData: FormData) {
  // Process Image
  const imageUrl = await processImageUpload(formData, "image");

  const rawData: Record<string, any> = {
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    locationName: formData.get("locationName"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state"),
    zip: formData.get("zip"),
    isActive: formData.get("isActive") === "true",
  };

  if (imageUrl) {
    rawData.imageUrl = imageUrl;
  }

  // Process events
  const eventsJson = formData.get("events") as string;
  let eventsData = [];
  if (eventsJson) {
    try {
      eventsData = JSON.parse(eventsJson);
    } catch (e) {
      console.error("Failed to parse events JSON", e);
    }
  }

  try {
    // Transaction to update fundraiser and replace events
    await prisma.$transaction(async (tx) => {
      // 1. Update basic info
      await tx.fundraiser.update({
        where: { id },
        data: rawData,
      });

      // 2. Delete existing events and create new ones (simplest approach for full replacement)
      // Alternatively, we could diff them, but full replacement is safer for this UI
      if (eventsData.length > 0) {
        await tx.fundraiserEvent.deleteMany({
          where: { fundraiserId: id },
        });

        await tx.fundraiserEvent.createMany({
          data: eventsData.map((e: any) => ({
            fundraiserId: id,
            startTime: new Date(e.startTime),
            endTime: e.endTime ? new Date(e.endTime) : null,
          })),
        });
      }
    });
  } catch (error) {
    console.error("Failed to update fundraiser:", error);
    throw new Error("Failed to update fundraiser");
  }

  revalidatePath("/admin/fundraisers");
  revalidatePath("/fundraisers");
  revalidatePath(`/fundraisers/[slug]`); // This is tricky without the slug, but next.js handles generic paths
  redirect("/admin/fundraisers");
}

export async function deleteFundraiser(id: string) {
  try {
    await prisma.fundraiser.delete({
      where: { id },
    });
    revalidatePath("/admin/fundraisers");
    revalidatePath("/fundraisers");
  } catch (error) {
    console.error("Failed to delete fundraiser:", error);
    throw new Error("Failed to delete fundraiser");
  }
}
