"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMembershipApplication(formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const school = formData.get("school") as string;
    const grade = formData.get("grade") as string;

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const phoneHome = formData.get("phoneHome") as string;
    const phoneCell = formData.get("phoneCell") as string;
    const email = formData.get("email") as string;

    const age = formData.get("age") as string;
    const birthDate = formData.get("birthDate") as string;

    const hideAddress = formData.get("hideAddress") === "on";
    const hidePhone = formData.get("hidePhone") === "on";
    const hideEmail = formData.get("hideEmail") === "on";

    const familyMembers = formData.get("familyMembers") as string; // JSON string

    const tier = formData.get("tier") as string;
    const amount = formData.get("amount") as string;

    await prisma.membershipApplication.create({
      data: {
        type,
        school,
        grade,
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        phoneHome,
        phoneCell,
        email,
        age,
        birthDate,
        hideAddress,
        hidePhone,
        hideEmail,
        familyMembers,
        tier,
        amount,
      },
    });

    revalidatePath("/admin/memberships");
    return { success: true };
  } catch (error) {
    console.error("Error creating membership application:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to submit application",
    };
  }
}

export async function updateMembershipApplication(id: string, formData: FormData) {
  try {
    const type = formData.get("type") as string;
    const school = formData.get("school") as string;
    const grade = formData.get("grade") as string;

    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;
    const phoneHome = formData.get("phoneHome") as string;
    const phoneCell = formData.get("phoneCell") as string;
    const email = formData.get("email") as string;

    const age = formData.get("age") as string;
    const birthDate = formData.get("birthDate") as string;

    const hideAddress = formData.get("hideAddress") === "on";
    const hidePhone = formData.get("hidePhone") === "on";
    const hideEmail = formData.get("hideEmail") === "on";

    const familyMembers = formData.get("familyMembers") as string; // JSON string

    const tier = formData.get("tier") as string;
    const amount = formData.get("amount") as string;

    await prisma.membershipApplication.update({
      where: { id },
      data: {
        type,
        school,
        grade,
        firstName,
        lastName,
        address,
        city,
        state,
        zip,
        phoneHome,
        phoneCell,
        email,
        age,
        birthDate,
        hideAddress,
        hidePhone,
        hideEmail,
        familyMembers,
        tier,
        amount,
      },
    });

    revalidatePath("/admin/memberships");
    revalidatePath(`/admin/memberships/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating membership application:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update application",
    };
  }
}

export async function getMembershipApplications() {
  try {
    const applications = await prisma.membershipApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, applications };
  } catch (error) {
    console.error("Error fetching membership applications:", error);
    return { success: false, error: "Failed to fetch applications" };
  }
}

export async function getMembershipApplicationById(id: string) {
  try {
    const application = await prisma.membershipApplication.findUnique({
      where: { id },
    });
    if (!application) {
        return { success: false, error: "Application not found" };
    }
    return { success: true, application };
  } catch (error) {
    console.error("Error fetching membership application:", error);
    return { success: false, error: "Failed to fetch application" };
  }
}

export async function deleteMembershipApplication(id: string) {
    try {
        await prisma.membershipApplication.delete({
            where: { id }
        });
        revalidatePath("/admin/memberships");
        return { success: true };
    } catch (error) {
        console.error("Error deleting membership application:", error);
        return { success: false, error: "Failed to delete application" };
    }
}
