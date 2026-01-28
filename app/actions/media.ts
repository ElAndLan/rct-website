"use server";

import { writeFile, readdir, mkdir } from "fs/promises";
import { join } from "path";
import crypto from "crypto";
import { put, list } from "@vercel/blob";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file uploaded" };
  }

  // Use Vercel Blob if token is present (Production)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const filename = `${crypto.randomUUID()}-${file.name}`;
      const blob = await put(filename, file, {
        access: "public",
      });
      return { success: true, url: blob.url };
    } catch (error) {
      console.error("Blob upload error:", error);
      return { success: false, error: "Failed to upload to blob storage" };
    }
  }

  // Fallback to local filesystem (Development)
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
  // Use Vercel Blob if token is present
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list();
      const images = blobs.map((blob) => blob.url);
      return { success: true, images };
    } catch (error) {
      console.error("Blob list error:", error);
      return { success: false, error: "Failed to list blob images" };
    }
  }

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
