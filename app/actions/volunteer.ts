"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sendEmail } from "@/lib/mail";

// --- Schema Validation ---
const VolunteerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
  about: z.string().optional(),
  availability: z.string().optional(),
  additionalComments: z.string().optional(),
  roles: z.array(z.string()).min(1, "Please select at least one role"),
}).refine(data => data.email || data.phoneNumber, {
  message: "Either email or phone number is required",
  path: ["email"],
});

export async function submitVolunteerApplication(formData: FormData) {
  const rawData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phoneNumber: formData.get("phoneNumber"),
    about: formData.get("about"),
    availability: formData.get("availability"),
    additionalComments: formData.get("additionalComments"),
    roles: formData.getAll("roles"),
  };

  try {
    const validated = VolunteerSchema.parse(rawData);

    // Save to Database
    await prisma.volunteerApplication.create({
      data: {
        fullName: validated.fullName,
        email: validated.email || null,
        phoneNumber: validated.phoneNumber || null,
        about: validated.about || null,
        availability: validated.availability || null,
        additionalComments: validated.additionalComments || null,
        roles: validated.roles,
      },
    });

    // Send Email Notification
    const theatreEmail = process.env.THEATRE_EMAIL || "admin@example.com";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    await sendEmail({
      to: theatreEmail,
      subject: `New Volunteer Application: ${validated.fullName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">New Volunteer Application</h1>
          <p><strong>Name:</strong> ${validated.fullName}</p>
          <p><strong>Contact:</strong> ${validated.email || ""} ${validated.phoneNumber ? `(${validated.phoneNumber})` : ""}</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <h3 style="margin-top: 0;">Roles of Interest</h3>
            <p>${validated.roles.join(", ")}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Availability</h3>
            <pre style="font-family: sans-serif; background: #fff; padding: 10px; border: 1px solid #eee;">${validated.availability || "N/A"}</pre>
          </div>

          <div style="margin: 20px 0;">
            <h3>About</h3>
            <p>${validated.about || "N/A"}</p>
          </div>

          ${validated.additionalComments ? `
          <div style="margin: 20px 0;">
            <h3>Additional Comments</h3>
            <p>${validated.additionalComments}</p>
          </div>
          ` : ""}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <a href="${appUrl}/admin/volunteers" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Panel</a>
          </div>
        </div>
      `
    });

    console.log("Volunteer application submitted:", validated);

    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return { success: false, error: firstError?.message || "Invalid input data" };
    }
    console.error("Failed to submit volunteer application:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function getVolunteerApplications() {
  try {
    return await prisma.volunteerApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch volunteer applications:", error);
    return [];
  }
}

export async function updateVolunteerStatus(id: string, status: string) {
  try {
    await prisma.volunteerApplication.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/volunteers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}

export async function deleteVolunteerApplication(id: string) {
  try {
    await prisma.volunteerApplication.delete({
      where: { id },
    });
    revalidatePath("/admin/volunteers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete application" };
  }
}
