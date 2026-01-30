import { FundraiserForm } from "@/components/admin/fundraiser-form";

export default function NewFundraiserPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Fundraiser</h1>
        <p className="text-muted-foreground">
          Create a new fundraising event.
        </p>
      </div>
      
      <FundraiserForm />
    </div>
  );
}
