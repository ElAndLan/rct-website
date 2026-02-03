import { getSiteSettings } from "@/app/actions/settings";
import { ContactInfoForm } from "./contact-info-form";

export default async function ContactInfoPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Contact Page Information
        </h1>
      </div>
      <div className="max-w-xl">
        <ContactInfoForm initialSettings={settings} />
      </div>
    </div>
  );
}
