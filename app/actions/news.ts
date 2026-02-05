"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

const newsPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  imageUrl: z.string().optional(),
  published: z.boolean().default(false),
});

export type NewsPostData = z.infer<typeof newsPostSchema>;

export const getNewsPosts = unstable_cache(
  async (includeUnpublished = false) => {
    try {
      const posts = await prisma.newsPost.findMany({
        where: includeUnpublished ? {} : { published: true },
        orderBy: { createdAt: "desc" },
      });
      return { success: true, posts };
    } catch (error) {
      console.error("Failed to fetch news posts:", error);
      return { success: false, error: "Failed to fetch news posts" };
    }
  },
  ["news-posts"],
  { tags: ["news"] },
);

export const getNewsPostBySlug = unstable_cache(
  async (slug: string) => {
    try {
      const post = await prisma.newsPost.findUnique({
        where: { slug },
      });
      return { success: true, post };
    } catch (error) {
      console.error("Failed to fetch news post:", error);
      return { success: false, error: "Failed to fetch news post" };
    }
  },
  ["news-post-by-slug"],
  { tags: ["news"] },
);

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function createNewsPost(data: NewsPostData) {
  try {
    const result = newsPostSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    let slug = generateSlug(result.data.title);

    // Ensure unique slug
    let counter = 1;
    while (await prisma.newsPost.findUnique({ where: { slug } })) {
      slug = `${generateSlug(result.data.title)}-${counter}`;
      counter++;
    }

    const post = await prisma.newsPost.create({
      data: {
        ...result.data,
        slug,
      },
    });

    revalidatePath("/announcements");
    revalidatePath("/admin/announcements");
    revalidatePath("/"); // In case we show previews elsewhere

    return { success: true, post };
  } catch (error) {
    console.error("Failed to create news post:", error);
    return { success: false, error: "Failed to create news post" };
  }
}

export async function updateNewsPost(id: string, data: NewsPostData) {
  try {
    const result = newsPostSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    // We typically don't update the slug to preserve SEO URLs, unless explicitly requested.
    // For now, we'll keep the slug as is.

    const post = await prisma.newsPost.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/announcements");
    revalidatePath(`/announcements/${post.slug}`);
    revalidatePath("/admin/announcements");

    return { success: true, post };
  } catch (error) {
    console.error("Failed to update news post:", error);
    return { success: false, error: "Failed to update news post" };
  }
}

export async function deleteNewsPost(id: string) {
  try {
    await prisma.newsPost.delete({
      where: { id },
    });

    revalidatePath("/announcements");
    revalidatePath("/admin/announcements");
    revalidateTag("news");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete news post:", error);
    return { success: false, error: "Failed to delete news post" };
  }
}
