import { SponsorForm } from "@/components/admin/sponsor-form";
import { getSponsorById } from "@/app/actions/sponsors";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSponsorPage({ params }: PageProps) {
  const { id } = await params;
  const sponsor = await getSponsorById(id);

  if (!sponsor) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Sponsor</h1>
        <p className="text-muted-foreground">Update sponsor details.</p>
      </div>

      <SponsorForm initialData={sponsor} />
    </div>
  );
}
