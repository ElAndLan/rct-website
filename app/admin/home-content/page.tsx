import { getSiteSettings } from "@/app/actions/settings";
import { HomeContentForm } from "./home-content-form";

export default async function HomeContentPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Home Page Content</h1>
      </div>
      <div className="max-w-xl">
        <HomeContentForm initialSettings={settings} />
      </div>
    </div>
  );
}
