"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

export async function getSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findMany();
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  } catch (error) {
    return {};
  }
}

export async function updateSiteSettings(formData: FormData) {
  try {
    const logoFile = formData.get("logo") as File;
    const logoUrlString = formData.get("logoUrl") as string;
    
    let finalLogoUrl = logoUrlString;

    // If a new file is uploaded, it takes precedence
    if (logoFile && logoFile.size > 0) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Vercel Blob
        const filename = `logo-${randomUUID()}-${logoFile.name}`;
        const blob = await put(filename, logoFile, { access: "public" });
        finalLogoUrl = blob.url;
      } else {
        // Local
        const buffer = Buffer.from(await logoFile.arrayBuffer());
        const filename = `logo-${randomUUID()}${path.extname(logoFile.name)}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await writeFile(path.join(uploadDir, filename), buffer);
        finalLogoUrl = `/uploads/${filename}`;
      }
    }

    if (finalLogoUrl) {
      await prisma.siteSettings.upsert({
        where: { key: "logoUrl" },
        update: { value: finalLogoUrl },
        create: { key: "logoUrl", value: finalLogoUrl },
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
