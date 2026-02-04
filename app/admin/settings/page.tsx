"use client";

import { getSiteSettings } from "@/app/actions/settings";
import { SettingsForm } from "./settings-form";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      const data = await getSiteSettings();
      setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
      </div>
      <div className="max-w-xl">
        <SettingsForm initialSettings={settings || {}} />
      </div>
    </div>
  );
}
