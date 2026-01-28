"use server"

import prisma from "@/lib/prisma"
import { getAdminEmails } from "./users"
import { z } from "zod"

const ContactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contactMethod: z.enum(["EMAIL", "PHONE", "TEXT"]),
    contactValue: z.string().min(1, "Contact info is required"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
})

export async function submitContactForm(formData: FormData) {
    const rawData = {
        name: formData.get("name"),
        contactMethod: formData.get("contactMethod"),
        contactValue: formData.get("contactValue"),
        subject: formData.get("subject"),
        message: formData.get("message"),
    }

    const result = ContactSchema.safeParse(rawData)

    if (!result.success) {
        return { success: false, error: result.error.errors[0].message }
    }

    const { name, contactMethod, contactValue, subject, message } = result.data

    try {
        await prisma.contactSubmission.create({
            data: {
                name,
                contactMethod,
                contactValue,
                subject,
                message,
            }
        })

        // Notify Admins
        const adminEmails = await getAdminEmails()
        console.log(`
        ------------------------------------
        EMAIL TO: ${adminEmails.join(", ")}
        SUBJECT: New Contact Form Submission: ${subject}
        
        From: ${name} (${contactMethod}: ${contactValue})
        Message: ${message}
        ------------------------------------
        `)

        return { success: true }
    } catch (error) {
        console.error("Failed to submit contact form:", error)
        return { success: false, error: "Failed to submit form" }
    }
}
