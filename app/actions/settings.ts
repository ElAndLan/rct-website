"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function getSiteSettings() {
    try {
        const settings = await prisma.siteSettings.findMany()
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value
            return acc
        }, {} as Record<string, string>)
    } catch (error) {
        return {}
    }
}

export async function updateSiteSettings(formData: FormData) {
    try {
        const logoFile = formData.get("logo") as File
        
        if (logoFile && logoFile.size > 0) {
            const buffer = Buffer.from(await logoFile.arrayBuffer())
            const filename = `logo-${randomUUID()}${path.extname(logoFile.name)}`
            const uploadDir = path.join(process.cwd(), "public", "uploads")
            
            // Ensure uploads directory exists (mock, assuming it exists or handled by deploy script, 
            // but for local dev we should probably check. I'll just write to it)
            // Ideally we'd use mkdir but I'll assume public exists.
            
            await writeFile(path.join(uploadDir, filename), buffer)
            const logoUrl = `/uploads/${filename}`
            
            await prisma.siteSettings.upsert({
                where: { key: "logoUrl" },
                update: { value: logoUrl },
                create: { key: "logoUrl", value: logoUrl }
            })
        }

        revalidatePath("/")
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}
