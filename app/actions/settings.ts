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

    // Home Section Fields
    const homeSectionImageFile = formData.get("homeSectionImage") as File;
    const homeSectionImageUrlString = formData.get(
      "homeSectionImageUrl",
    ) as string;
    const homeSectionTitle = formData.get("homeSectionTitle") as string;
    const homeSectionBody = formData.get("homeSectionBody") as string;

    // --- Helper to process image upload/url ---
    async function processImage(
      file: File | null,
      urlString: string,
      prefix: string,
    ): Promise<string> {
      let finalUrl = urlString;

      // Fix relative paths
      if (
        finalUrl &&
        !finalUrl.startsWith("http") &&
        !finalUrl.startsWith("/")
      ) {
        finalUrl = "/" + finalUrl;
      }

      // Handle file upload
      if (file && file.size > 0) {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
          // Vercel Blob
          const filename = `${prefix}-${randomUUID()}-${file.name}`;
          const blob = await put(filename, file, { access: "public" });
          finalUrl = blob.url;
        } else {
          // Local
          const buffer = Buffer.from(await file.arrayBuffer());
          const filename = `${prefix}-${randomUUID()}${path.extname(file.name)}`;
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await writeFile(path.join(uploadDir, filename), buffer);
          finalUrl = `/uploads/${filename}`;
        }
      }
      return finalUrl;
    }

    // Process Logo
    const finalLogoUrl = await processImage(logoFile, logoUrlString, "logo");

    // Process Home Section Image
    const finalHomeSectionImageUrl = await processImage(
      homeSectionImageFile,
      homeSectionImageUrlString,
      "home-section",
    );

    // Process Donation Image
    const finalDonationImageUrl = await processImage(
      donationImageFile,
      donationImageUrlString,
      "donation",
    );

    // Upsert Settings
    const settingsToUpdate = [
      { key: "logoUrl", value: finalLogoUrl },
      { key: "homeSectionImageUrl", value: finalHomeSectionImageUrl },
      { key: "homeSectionTitle", value: homeSectionTitle },
      { key: "homeSectionBody", value: homeSectionBody },
      { key: "donationTitle", value: donationTitle },
      { key: "donationBody", value: donationBody },
      { key: "donationPaypalLink", value: donationPaypalLink },
      { key: "donationImageUrl", value: finalDonationImageUrl },
    ];

    for (const setting of settingsToUpdate) {
      if (setting.value !== undefined && setting.value !== null) {
        await prisma.siteSettings.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: { key: setting.key, value: setting.value },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/donate");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
