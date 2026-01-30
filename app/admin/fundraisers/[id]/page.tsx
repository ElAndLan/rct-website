import { FundraiserForm } from "@/components/admin/fundraiser-form";
import { getFundraiserById } from "@/app/actions/fundraisers";
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditFundraiserPage({ params }: PageProps) {
  const { id } = await params;
  const fundraiser = await getFundraiserById(id);

  if (!fundraiser) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Fundraiser</h1>
        <p className="text-muted-foreground">Update fundraiser details.</p>
      </div>

      <FundraiserForm initialData={fundraiser} />
    </div>
  );
}
