"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import path from "path";
import { processAndSaveImage } from "./media";

// --- Types ---
export type ShowWithDetails = Awaited<ReturnType<typeof getShowById>>;

// --- Fetch Actions ---

export const getShows = unstable_cache(
  async () => {
    try {
      return await prisma.show.findMany({
        orderBy: { startDate: "desc" },
      });
    } catch (error) {
      console.error("Failed to fetch shows:", error);
      return [];
    }
  },
  ["shows-list"],
  { tags: ["shows"] },
);

export const getCurrentShows = unstable_cache(
  async () => {
    try {
      const today = new Date();
      // Reset time to start of day for comparison
      today.setHours(0, 0, 0, 0);

      return await prisma.show.findMany({
        where: {
          OR: [{ endDate: { gte: today } }, { endDate: null }],
        },
        orderBy: { startDate: "asc" }, // Current/Upcoming usually asc order? Or desc? Let's keep desc for now or match user pref.
        // Actually, upcoming shows usually listed soonest first.
      });
    } catch (error) {
      console.error("Failed to fetch current shows:", error);
      return [];
    }
  },
  ["current-shows-list"],
  { tags: ["shows"] },
);

export const getPreviousShows = unstable_cache(
  async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return await prisma.show.findMany({
        where: {
          endDate: { lt: today },
        },
        orderBy: { endDate: "desc" }, // Most recent past show first
      });
    } catch (error) {
      console.error("Failed to fetch previous shows:", error);
      return [];
    }
  },
  ["previous-shows-list"],
  { tags: ["shows"] },
);

export const getShowById = unstable_cache(
  async (id: string) => {
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
          performances: {
            orderBy: { date: "asc" },
          },
        },
      });
    } catch (error) {
      console.error("Failed to fetch show:", error);
      return null;
    }
  },
  ["show-by-id"],
  { tags: ["shows"] },
);

export const getShowBySlug = unstable_cache(
  async (slug: string) => {
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
          performances: {
            orderBy: { date: "asc" },
          },
        },
      });
    } catch (error) {
      console.error("Failed to fetch show:", error);
      return null;
    }
  },
  ["show-by-slug"],
  { tags: ["shows"] },
);

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
  revalidateTag("shows");
  redirect("/admin/shows");
}

export async function updateShow(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const shortDescription = formData.get("shortDescription") as string;
  const status = formData.get("status") as string;
  const ticketLink = formData.get("ticketLink") as string;
  const auditionLink = formData.get("auditionLink") as string;
  const volunteerLink = formData.get("volunteerLink") as string;
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
      auditionLink,
      volunteerLink,
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
  revalidateTag("shows");
}

export async function addPerformance(showId: string, formData: FormData) {
  const dateStr = formData.get("date") as string;
  if (!dateStr) return;

  const date = new Date(dateStr);

  await prisma.showPerformance.create({
    data: {
      showId,
      date,
    },
  });

  revalidatePath(`/admin/shows/${showId}`);
  revalidateTag("shows");
}

export async function deletePerformance(performanceId: string, showId: string) {
  await prisma.showPerformance.delete({ where: { id: performanceId } });
  revalidatePath(`/admin/shows/${showId}`);
  revalidateTag("shows");
}

export async function updateTicketPrice(showId: string, formData: FormData) {
  const price = formData.get("ticketPrice");

  await prisma.show.update({
    where: { id: showId },
    data: { ticketPrice: Number(price) },
  });

  revalidatePath(`/admin/shows/${showId}`);
  revalidateTag("shows");
}

export async function deleteShow(id: string) {
  await prisma.show.delete({ where: { id } });
  revalidatePath("/admin/shows");
  revalidateTag("shows");
}

// --- Photo Management ---

async function saveFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return processAndSaveImage(buffer, file.name);
}

async function saveUrl(url: string): Promise<string> {
  if (url.includes(".public.blob.vercel-storage.com")) {
    return url;
  }

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image from URL");
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Try to determine extension
  let ext = path.extname(url).split("?")[0]; // Remove query params
  if (!ext || ext.length > 5) {
    const contentType = response.headers.get("content-type");
    if (contentType === "image/jpeg") ext = ".jpg";
    else if (contentType === "image/png") ext = ".png";
    else if (contentType === "image/webp") ext = ".webp";
    else if (contentType === "image/gif") ext = ".gif";
    else ext = ".jpg"; // Fallback
  }

  return processAndSaveImage(buffer, `download${ext}`);
}

export async function uploadShowPhoto(showId: string, formData: FormData) {
  const file = formData.get("photo") as File;
  const photoUrlInput = formData.get("photo_url") as string;
  const photoExisting = formData.get("photo_existing") as string;
  const caption = (formData.get("caption") as string) || "";

  if ((!file || file.size === 0) && !photoUrlInput && !photoExisting) {
    return { error: "No file provided" };
  }

  try {
    let url = "";
    if (file && file.size > 0) {
      url = await saveFile(file);
    } else if (photoUrlInput) {
      url = await saveUrl(photoUrlInput);
    } else if (photoExisting) {
      url = photoExisting;
    }

    await prisma.showPhoto.create({
      data: {
        showId,
        url,
        caption,
      },
    });

    revalidatePath(`/admin/shows/${showId}`);
    revalidateTag("shows");
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
  revalidateTag("shows");
}

export async function updateShowMainImage(showId: string, formData: FormData) {
  const file = formData.get("image") as File;
  const photoUrlInput = formData.get("image_url") as string;
  const photoExisting = formData.get("image_existing") as string;

  if ((!file || file.size === 0) && !photoUrlInput && !photoExisting) {
    return { error: "No file provided" };
  }

  try {
    let url = "";
    if (file && file.size > 0) {
      url = await saveFile(file);
    } else if (photoUrlInput) {
      url = await saveUrl(photoUrlInput);
    } else if (photoExisting) {
      url = photoExisting;
    }

    await prisma.show.update({
      where: { id: showId },
      data: { imageUrl: url },
    });
    revalidatePath(`/admin/shows/${showId}`);
    revalidateTag("shows");
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
  const file = formData.get("photo") as File;
  const photoUrlInput = formData.get("photo_url") as string;
  const photoExisting = formData.get("photo_existing") as string;

  let photoUrl: string | undefined = undefined;

  try {
    if (file && file.size > 0) {
      photoUrl = await saveFile(file);
    } else if (photoUrlInput) {
      photoUrl = await saveUrl(photoUrlInput);
    } else if (photoExisting) {
      photoUrl = photoExisting;
    }
  } catch (error) {
    console.error("Failed to upload cast photo:", error);
  }

  await prisma.castMember.create({
    data: {
      showId,
      name,
      role,
      bio,
      imageUrl: photoUrl,
    },
  });

  revalidatePath(`/admin/shows/${showId}`);
  revalidateTag("shows");
}

export async function updateCastMember(
  castId: string,
  showId: string,
  formData: FormData,
) {
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const bio = formData.get("bio") as string;
  const file = formData.get("photo") as File;
  const photoUrlInput = formData.get("photo_url") as string;
  const photoExisting = formData.get("photo_existing") as string;

  const data: any = { name, role, bio };

  try {
    if (file && file.size > 0) {
      data.imageUrl = await saveFile(file);
    } else if (photoUrlInput) {
      data.imageUrl = await saveUrl(photoUrlInput);
    } else if (photoExisting) {
      data.imageUrl = photoExisting;
    }
  } catch (error) {
    console.error("Failed to upload cast photo:", error);
  }

  await prisma.castMember.update({
    where: { id: castId },
    data,
  });

  revalidatePath(`/admin/shows/${showId}`);
  revalidateTag("shows");
}

export async function deleteCastMember(memberId: string, showId: string) {
  await prisma.castMember.delete({ where: { id: memberId } });
  revalidatePath(`/admin/shows/${showId}`);
  revalidateTag("shows");
}
