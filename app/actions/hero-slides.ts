"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { z } from "zod";

const heroSlideSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
  secondaryLinkText: z.string().optional(),
  secondaryLinkUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type HeroSlideData = z.infer<typeof heroSlideSchema>;

export const getHeroSlides = unstable_cache(
  async () => {
    try {
      // Debugging Prisma Availability
      if (!prisma) {
        console.error("Prisma client is undefined in getHeroSlides");
        return { success: false, error: "Database connection failed" };
      }

      // Check if heroSlide model exists on prisma instance
      if (!prisma.heroSlide) {
        // Try to re-instantiate prisma if model is missing (hot reload issue?)
        // This is a failsafe for development environment
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "prisma.heroSlide missing, attempting to use global prisma...",
          );
        }

        console.error(
          "prisma.heroSlide is undefined. Client generation might have failed.",
        );
        return {
          success: false,
          error: "Database model not found. Please restart server.",
        };
      }

      const slides = await prisma.heroSlide.findMany({
        orderBy: {
          order: "asc",
        },
      });
      return { success: true, slides };
    } catch (error) {
      console.error("Failed to fetch hero slides:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch slides",
      };
    }
  },
  ["hero-slides"],
  { tags: ["hero-slides"] },
);

export async function createHeroSlide(data: HeroSlideData) {
  try {
    const result = heroSlideSchema.safeParse(data);

    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    // Get the highest order to append to the end
    const lastSlide = await prisma.heroSlide.findFirst({
      orderBy: { order: "desc" },
    });
    const newOrder = lastSlide ? lastSlide.order + 1 : 0;

    const slide = await prisma.heroSlide.create({
      data: {
        ...result.data,
        order: newOrder,
      },
    });

    revalidatePath("/");
    revalidateTag("hero-slides", "max");
    return { success: true, slide };
  } catch (error) {
    console.error("Failed to create hero slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create slide",
    };
  }
}

export async function updateHeroSlide(id: string, data: HeroSlideData) {
  try {
    const result = heroSlideSchema.safeParse(data);

    if (!result.success) {
      return { success: false, error: result.error.issues[0].message };
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/");
    return { success: true, slide };
  } catch (error) {
    console.error("Failed to update hero slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update slide",
    };
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    await prisma.heroSlide.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidateTag("hero-slides", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete hero slide:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete slide",
    };
  }
}

export async function reorderHeroSlides(
  items: { id: string; order: number }[],
) {
  try {
    const updates = items.map((item) =>
      prisma.heroSlide.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    );

    await prisma.$transaction(updates);
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder hero slides:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to reorder slides",
    };
  }
}
