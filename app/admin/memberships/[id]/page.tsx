import { getMembershipApplicationById } from "@/app/actions/membership";
import { AdminMembershipForm } from "@/components/admin/membership-edit-form";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditMembershipPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getMembershipApplicationById(id);

  if (!result.success || !result.application) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Membership</h1>
          <p className="text-muted-foreground">
            Manage membership details for {result.application.firstName} {result.application.lastName}.
          </p>
        </div>
      </div>
      
      <AdminMembershipForm application={result.application} />
    </div>
  );
}
