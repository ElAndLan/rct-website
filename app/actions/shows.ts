"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

// --- Types ---
export type ShowWithDetails = Awaited<ReturnType<typeof getShowById>>;

// --- Fetch Actions ---

export async function getShows() {
  try {
    return await prisma.show.findMany({
      orderBy: { startDate: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch shows:", error);
    return [];
  }
}

export async function getShowById(id: string) {
  try {
    return await prisma.show.findUnique({
      where: { id },
      include: {
        cast: {
          orderBy: { order: "asc" },
        },
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch show:", error);
    return null;
  }
}

export async function getShowBySlug(slug: string) {
  try {
    return await prisma.show.findUnique({
      where: { slug },
      include: {
        cast: {
          orderBy: { order: "asc" },
        },
        photos: {
          orderBy: { order: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch show:", error);
    return null;
  }
}

// --- Create/Update/Delete Show ---

export async function createShow(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = title
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]/g, "");

  // Basic fields
  const description = formData.get("description") as string;
  const status = formData.get("status") as string;
  const ticketLink = formData.get("ticketLink") as string;
  const programPdfUrl = formData.get("programPdfUrl") as string;

  // Default dates (can be updated later)
  const startDate = new Date();

  await prisma.show.create({
    data: {
      title,
      slug,
      description,
      status,
      ticketLink,
      programPdfUrl,
      isProgramActive: !!programPdfUrl,
      startDate,
    },
  });

  revalidatePath("/admin/shows");
  redirect("/admin/shows");
}

export async function updateShow(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const status = formData.get("status") as string;
  const ticketLink = formData.get("ticketLink") as string;
  const location = formData.get("location") as string;
  const programPdfUrl = formData.get("programPdfUrl") as string;
  const programContent = formData.get("programContent") as string;

  // Dates
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const startDate = startDateStr ? new Date(startDateStr) : undefined;
  const endDate = endDateStr ? new Date(endDateStr) : undefined;

  await prisma.show.update({
    where: { id },
    data: {
      title,
      description,
      shortDescription,
      status,
      ticketLink,
      location,
      programPdfUrl,
      programContent,
      startDate,
      endDate,
      isProgramActive: !!(programPdfUrl || programContent),
    },
  });

  revalidatePath(`/admin/shows/${id}`);
  revalidatePath("/admin/shows");
  revalidatePath(`/shows`); // Revalidate public pages
}

export async function deleteShow(id: string) {
  await prisma.show.delete({ where: { id } });
  revalidatePath("/admin/shows");
}

// --- Photo Management ---

async function saveFile(file: File): Promise<string> {
  // Vercel Blob (Production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const filename = `${randomUUID()}-${file.name}`;
    const blob = await put(filename, file, { access: "public" });
    return blob.url;
  }

  // Local Filesystem (Development)
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}${path.extname(file.name)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  // Note: In production, ensure 'public/uploads' exists or use S3/Blob storage
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function uploadShowPhoto(showId: string, formData: FormData) {
  const file = formData.get("photo") as File;
  const caption = (formData.get("caption") as string) || "";

  if (!file || file.size === 0) return { error: "No file provided" };

  try {
    const url = await saveFile(file);

    await prisma.showPhoto.create({
      data: {
        showId,
        url,
        caption,
      },
    });

    revalidatePath(`/admin/shows/${showId}`);
    return { success: true };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Upload failed" };
  }
}

export async function deleteShowPhoto(photoId: string, showId: string) {
  // Ideally delete file from disk too, but for now just DB
  await prisma.showPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/admin/shows/${showId}`);
}

export async function updateShowMainImage(showId: string, formData: FormData) {
  const file = formData.get("image") as File;
  if (!file || file.size === 0) return { error: "No file provided" };

  try {
    const url = await saveFile(file);
    await prisma.show.update({
      where: { id: showId },
      data: { imageUrl: url },
    });
    revalidatePath(`/admin/shows/${showId}`);
    return { success: true };
  } catch (error) {
    return { error: "Upload failed" };
  }
}

// --- Cast Management ---

export async function addCastMember(showId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const bio = formData.get("bio") as string;

  await prisma.castMember.create({
    data: {
      showId,
      name,
      role,
      bio,
    },
  });

  revalidatePath(`/admin/shows/${showId}`);
}

export async function deleteCastMember(memberId: string, showId: string) {
  await prisma.castMember.delete({ where: { id: memberId } });
  revalidatePath(`/admin/shows/${showId}`);
}
