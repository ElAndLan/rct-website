"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function getPages() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return { success: true, pages };
  } catch (error) {
    console.error("Error fetching pages:", error);
    return { success: false, error: "Failed to fetch pages" };
  }
}

export async function getPage(id: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { id },
    });
    return { success: true, page };
  } catch (error) {
    console.error("Error fetching page:", error);
    return { success: false, error: "Failed to fetch page" };
  }
}

export async function getPageBySlug(slug: string) {
  try {
    const page = await prisma.page.findUnique({
      where: { slug },
    });
    return { success: true, page };
  } catch (error) {
    console.error("Error fetching page by slug:", error);
    return { success: false, error: "Failed to fetch page" };
  }
}

export async function createPage(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  let slug = formData.get("slug") as string;
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !content) {
    return { success: false, error: "Title and content are required" };
  }

  // Generate slug if not provided, or normalize provided slug
  if (!slug) {
    slug = generateSlug(title);
  } else {
    slug = generateSlug(slug);
  }

  // Ensure slug is unique
  const existingPage = await prisma.page.findUnique({
    where: { slug },
  });

  if (existingPage) {
    return { success: false, error: "A page with this slug already exists" };
  }

  try {
    await prisma.page.create({
      data: {
        title,
        slug,
        content,
        isPublished,
      },
    });
  } catch (error) {
    console.error("Error creating page:", error);
    return { success: false, error: "Failed to create page" };
  }

  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePage(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  let slug = formData.get("slug") as string;
  const isPublished = formData.get("isPublished") === "on";

  if (!title || !content) {
    return { success: false, error: "Title and content are required" };
  }

  // Generate slug if not provided, or normalize provided slug
  if (!slug) {
    slug = generateSlug(title);
  } else {
    slug = generateSlug(slug);
  }

  // Check if slug is taken by another page
  const existingPage = await prisma.page.findUnique({
    where: { slug },
  });

  if (existingPage && existingPage.id !== id) {
    return { success: false, error: "A page with this slug already exists" };
  }

  try {
    await prisma.page.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        isPublished,
      },
    });
  } catch (error) {
    console.error("Error updating page:", error);
    return { success: false, error: "Failed to update page" };
  }

  revalidatePath("/admin/pages");
  revalidatePath(`/${slug}`); // Revalidate the public page
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  try {
    await prisma.page.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting page:", error);
    return { success: false, error: "Failed to delete page" };
  }

  revalidatePath("/admin/pages");
  return { success: true };
}

export async function togglePageStatus(id: string, isPublished: boolean) {
  try {
    const page = await prisma.page.update({
      where: { id },
      data: { isPublished },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating page status:", error);
    return { success: false, error: "Failed to update page status" };
  }
}
