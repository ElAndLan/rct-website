"use server";

import { readdir, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

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
      .filter((file) => imageExtensions.includes(path.extname(file).toLowerCase()))
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

async function saveBuffer(buffer: Buffer, originalFilename: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const filename = `${randomUUID()}-${originalFilename}`;
    const blob = await put(filename, buffer, { access: "public" });
    return blob.url;
  }

  const filename = `${randomUUID()}${path.extname(originalFilename)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // ignore
  }

  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${filename}`;
}

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { success: false, error: "No file provided" };

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveBuffer(buffer, file.name);
    return { success: true, url };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Upload failed" };
  }
}
