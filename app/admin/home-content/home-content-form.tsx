"use client";

import { useState } from "react";
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

export function HomeContentForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [homeSectionImageUrl, setHomeSectionImageUrl] = useState(
    initialSettings.homeSectionImageUrl || "",
  );
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    const result = await updateSiteSettings(formData);
    setIsSubmitting(false);

    if (result.success) {
      alert("Home content updated successfully!");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Home Page Content</CardTitle>
        <CardDescription>
          Configure the welcome section below the carousel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeSectionTitle">Section Title</Label>
              <Input
                id="homeSectionTitle"
                name="homeSectionTitle"
                defaultValue={initialSettings.homeSectionTitle}
                placeholder="Welcome to Reading Civic Theatre!"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeSectionBody">Section Body</Label>
              <textarea
                id="homeSectionBody"
                name="homeSectionBody"
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={initialSettings.homeSectionBody}
                placeholder="Enter the main text content..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="homeSectionImage">Section Image</Label>
              <input
                type="hidden"
                name="homeSectionImageUrl"
                value={homeSectionImageUrl}
              />

              {homeSectionImageUrl && (
                <div className="mb-4 p-4 border rounded-md bg-neutral-100 flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={homeSectionImageUrl}
                    alt="Home Section"
                    className="max-h-[300px] w-auto object-contain"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={homeSectionImageUrl}
                  onChange={(e) => setHomeSectionImageUrl(e.target.value)}
                  placeholder="https://... or /uploads/..."
                />
                <MediaBrowser onSelect={setHomeSectionImageUrl} />
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Or upload directly:</p>
                <Input
                  id="homeSectionImage"
                  name="homeSectionImage"
                  type="file"
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
