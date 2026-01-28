"use server";

import { writeFile, readdir, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file uploaded" };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure uploads directory exists
  const uploadDir = join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Ignore error if directory exists
  }

  // Generate unique filename to avoid collisions
  // Keep original extension
  const originalName = file.name;
  const ext = originalName.split(".").pop();
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filepath = join(uploadDir, filename);

  try {
    await writeFile(filepath, buffer);
    return { success: true, url: `/uploads/${filename}` };
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, error: "Failed to save file" };
  }
}

export async function getUploadedImages() {
  const uploadDir = join(process.cwd(), "public", "uploads");
  try {
    // Create directory if it doesn't exist to avoid error
    await mkdir(uploadDir, { recursive: true });

    const files = await readdir(uploadDir);
    // Filter for images (basic check)
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file))
      .map((file) => `/uploads/${file}`);

    return { success: true, images };
  } catch (error) {
    console.error("List images error:", error);
    return { success: false, error: "Failed to list images" };
  }
}
