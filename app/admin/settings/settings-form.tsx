"use client";

import { useState, useEffect } from "react";
import { updateSiteSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { MediaBrowser } from "@/components/admin/media-browser";

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    const result = await updateSiteSettings(formData);
    setIsSubmitting(false);

    if (result.success) {
      alert("Settings updated successfully!");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Update the site logo and branding assets.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo">Logo (214px x 118px)</Label>

            {/* Hidden Input for Form Data */}
            <input type="hidden" name="logoUrl" value={logoUrl} />

            {logoUrl && (
              <div className="mb-4 p-4 border rounded-md bg-neutral-100 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt="Current Logo"
                  className="max-h-[118px] w-auto object-contain"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Input
                id="logoUrlDisplay"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://... or /uploads/..."
              />
              <MediaBrowser onSelect={setLogoUrl} />
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Or upload directly:</p>
              <Input id="logo" name="logo" type="file" accept="image/*" />
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              Recommended resolution: 214px by 118px.
            </p>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
