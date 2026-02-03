import { SponsorForm } from "@/components/admin/sponsor-form";

export default function NewSponsorPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Sponsor</h1>
        <p className="text-muted-foreground">
          Add a new sponsor or partner.
        </p>
      </div>
      
      <SponsorForm />
    </div>
  );
}
