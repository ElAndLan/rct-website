import { getSiteSettings } from "@/app/actions/settings";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
      </div>
      <div className="max-w-xl">
        <SettingsForm initialSettings={settings} />
      </div>
    </div>
  );
}
