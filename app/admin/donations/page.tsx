import { getSiteSettings } from "@/app/actions/settings";
import { DonationContentForm } from "./donation-content-form";

export default async function DonationContentPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Donation Page</h1>
      </div>
      <div className="max-w-xl">
        <DonationContentForm initialSettings={settings} />
      </div>
    </div>
  );
}
