"use server";

import { readdir, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import sharp from "sharp";

export async function getUploadedImages() {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // ignore
    }

    const files = await readdir(uploadDir);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    const images = files
      .filter((file) =>
        imageExtensions.includes(path.extname(file).toLowerCase()),
      )
      .map((file) => `/uploads/${file}`);
    return { success: true, images };
  } catch (error) {
    console.error("Failed to read uploads directory:", error);
    return { success: false, images: [] };
  }
}

// Alias for compatibility if needed, or used by image-picker
export async function getUploadedFiles() {
  const result = await getUploadedImages();
  return result.images || [];
}

export async function processAndSaveImage(
  buffer: Buffer,
  originalFilename: string,
): Promise<string> {
  const ext = path.extname(originalFilename).toLowerCase();
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".tiff",
    ".avif",
  ];

  let finalBuffer = buffer;
  let finalFilename = originalFilename;

  // Only process if it is an image
  if (imageExtensions.includes(ext)) {
    try {
      console.log(`Processing image: ${originalFilename}`);
      finalBuffer = await sharp(buffer)
        .webp({ quality: 80 }) // Compress to WebP with 80% quality
        .toBuffer();

      // Change extension to .webp
      const nameWithoutExt = path.basename(originalFilename, ext);
      finalFilename = `${nameWithoutExt}.webp`;
      console.log(`Converted to WebP: ${finalFilename}`);
    } catch (error) {
      console.error("Failed to convert image to WebP, saving original:", error);
      // Fallback to original buffer and filename if conversion fails
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const filename = `${randomUUID()}-${finalFilename}`;
    const blob = await put(filename, finalBuffer, { access: "public" });
    return blob.url;
  }

  const filename = `${randomUUID()}-${finalFilename}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // ignore
  }

  await writeFile(path.join(uploadDir, filename), finalBuffer);
  return `/uploads/${filename}`;
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0)
    return { success: false, error: "No file provided" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await processAndSaveImage(buffer, file.name);
    return { success: true, url };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}
