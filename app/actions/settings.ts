"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import path from "path";
import { processAndSaveImage } from "./media";

export const getSiteSettings = unstable_cache(
  async () => {
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
  },
  ["site-settings"],
  { tags: ["site-settings"] },
);

export async function updateSiteSettings(formData: FormData) {
  try {
    const logoFile = formData.get("logo") as File;
    const logoUrlString = formData.get("logoUrl") as string;

    const headerBannerFile = formData.get("headerBanner") as File;
    const headerBannerUrlString = formData.get("headerBannerUrl") as string;

    // Home Section Fields
    const homeSectionImageFile = formData.get("homeSectionImage") as File;
    const homeSectionImageUrlString = formData.get(
      "homeSectionImageUrl",
    ) as string;
    const homeSectionTitle = formData.get("homeSectionTitle") as string;
    const homeSectionBody = formData.get("homeSectionBody") as string;

    // Donation Section Fields
    const donationImageFile = formData.get("donationImage") as File;
    const donationImageUrlString = formData.get("donationImageUrl") as string;
    const donationTitle = formData.get("donationTitle") as string;
    const donationBody = formData.get("donationBody") as string;
    const donationPaypalLink = formData.get("donationPaypalLink") as string;

    // Footer Fields
    const footerDescription = formData.get("footerDescription") as string;
    const contactAddress1 = formData.get("contactAddress1") as string;
    const contactAddress2 = formData.get("contactAddress2") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const socialFacebook = formData.get("socialFacebook") as string;
    const socialInstagram = formData.get("socialInstagram") as string;
    const footerCopyright = formData.get("footerCopyright") as string;
    const footerLinks = formData.get("footerLinks") as string; // JSON string

    // Contact Page Fields
    const contactPageTitle = formData.get("contactPageTitle") as string;
    const contactPageBody = formData.get("contactPageBody") as string;
    const contactNotificationEmail = formData.get(
      "contactNotificationEmail",
    ) as string;

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
        const buffer = Buffer.from(await file.arrayBuffer());
        finalUrl = await processAndSaveImage(buffer, file.name);
      }

      return finalUrl;
    }

    // Process Logo
    const finalLogoUrl = await processImage(logoFile, logoUrlString, "logo");

    // Process Header Banner
    const finalHeaderBannerUrl = await processImage(
      headerBannerFile,
      headerBannerUrlString,
      "header-banner",
    );

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
      { key: "headerBannerUrl", value: finalHeaderBannerUrl },
      { key: "homeSectionImageUrl", value: finalHomeSectionImageUrl },
      { key: "homeSectionTitle", value: homeSectionTitle },
      { key: "homeSectionBody", value: homeSectionBody },
      { key: "donationTitle", value: donationTitle },
      { key: "donationBody", value: donationBody },
      { key: "donationPaypalLink", value: donationPaypalLink },
      { key: "donationImageUrl", value: finalDonationImageUrl },
      { key: "footerDescription", value: footerDescription },
      { key: "contactAddress1", value: contactAddress1 },
      { key: "contactAddress2", value: contactAddress2 },
      { key: "contactEmail", value: contactEmail },
      { key: "socialFacebook", value: socialFacebook },
      { key: "socialInstagram", value: socialInstagram },
      { key: "footerCopyright", value: footerCopyright },
      { key: "footerLinks", value: footerLinks },
      { key: "contactPageTitle", value: contactPageTitle },
      { key: "contactPageBody", value: contactPageBody },
      { key: "contactNotificationEmail", value: contactNotificationEmail },
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
    revalidateTag("site-settings", "max");
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
