"use server"

import prisma from "@/lib/prisma"
import { getAdminEmails } from "./users"
import { z } from "zod"
import { sendEmail } from "@/lib/mail"
import { getSiteSettings } from "./settings"

const ContactSchema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    body: z.string().min(1, "Message is required"),
})

export async function submitContactForm(formData: FormData) {
    const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        title: formData.get("title"),
        body: formData.get("body"),
    }

    const result = ContactSchema.safeParse(rawData)

    if (!result.success) {
        return { success: false, error: result.error.issues[0].message }
    }

    const { firstName, lastName, email, phone, title, body } = result.data
    const fullName = `${firstName} ${lastName}`

    try {
        // Save to Database
        await prisma.contactSubmission.create({
            data: {
                name: fullName,
                email,
                phone: phone || null,
                subject: title,
                message: body,
            }
        })

        // Determine Recipient
        const settings = await getSiteSettings()
        const recipientEmail = settings.contactNotificationEmail 
            ? [settings.contactNotificationEmail] 
            : await getAdminEmails()

        if (recipientEmail.length === 0) {
            // Fallback if no admins and no setting
            console.warn("No recipient email configured for contact form.")
            return { success: true }
        }

        // Send Email
        await sendEmail({
            to: recipientEmail[0], // Send to the first configured email (resend usually takes single string or array, but my helper takes string)
            subject: `New Contact Form: ${title}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>New Contact Submission</h2>
                    <p><strong>From:</strong> ${fullName}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
                    <p><strong>Title:</strong> ${title}</p>
                    <hr />
                    <h3>Message:</h3>
                    <p style="white-space: pre-wrap;">${body}</p>
                </div>
            `
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to submit contact form:", error)
        return { success: false, error: "Failed to submit form" }
    }
}
