"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export type MenuItemWithChildren = {
  id: string;
  label: string;
  path: string | null;
  order: number;
  parentId: string | null;
  children: MenuItemWithChildren[];
};

export const getMenuItems = unstable_cache(
  async (): Promise<MenuItemWithChildren[]> => {
    try {
      const items = await prisma.menuItem.findMany({
        orderBy: [{ order: "asc" }, { label: "asc" }],
      });

      // Reconstruct hierarchy
      const rootItems = items.filter((item) => !item.parentId);

      return rootItems.map((root) => ({
        ...root,
        children: items
          .filter((child) => child.parentId === root.id)
          .map((child) => ({ ...child, children: [] })), // Only supporting 2 levels for now as requested
      }));
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      return [];
    }
  },
  ["menu-items"],
  { tags: ["menu-items"] },
);

export async function updateMenuOrder(items: { id: string; order: number }[]) {
  // Transaction to update all positions
  await prisma.$transaction(
    items.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order },
      }),
    ),
  );
  revalidatePath("/", "layout"); // Refresh the frontend menu
  revalidatePath("/admin/menu");
  revalidateTag("menu-items");
}

export async function createMenuItem(data: {
  label: string;
  path: string;
  parentId?: string;
}) {
  // Get max order to append to end
  const lastItem = await prisma.menuItem.findFirst({
    where: { parentId: data.parentId || null },
    orderBy: { order: "desc" },
  });

  const newOrder = lastItem ? lastItem.order + 1 : 0;

  await prisma.menuItem.create({
    data: {
      label: data.label,
      path: data.path,
      parentId: data.parentId || null,
      order: newOrder,
    },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/menu");
  revalidateTag("menu-items");
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/menu");
  revalidateTag("menu-items");
}
