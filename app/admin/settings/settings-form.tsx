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
  const [homeSectionImageUrl, setHomeSectionImageUrl] = useState(
    initialSettings.homeSectionImageUrl || "",
  );
  const [donationImageUrl, setDonationImageUrl] = useState(
    initialSettings.donationImageUrl || "",
  );
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

          <div className="space-y-2 pt-6 border-t">
            <h3 className="text-lg font-semibold">Home Page Content</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure the welcome section below the carousel.
            </p>

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
                  <p className="text-sm font-medium mb-1">
                    Or upload directly:
                  </p>
                  <Input
                    id="homeSectionImage"
                    name="homeSectionImage"
                    type="file"
                    accept="image/*"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t">
            <h3 className="text-lg font-semibold">Donation Page</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure the content for the donation page.
            </p>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="donationTitle">Donation Title</Label>
                <Input
                  id="donationTitle"
                  name="donationTitle"
                  defaultValue={initialSettings.donationTitle}
                  placeholder="Support Reading Civic Theatre"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationBody">Donation Message</Label>
                <textarea
                  id="donationBody"
                  name="donationBody"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={initialSettings.donationBody}
                  placeholder="Explain why donations are important..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationPaypalLink">PayPal Donation Link</Label>
                <Input
                  id="donationPaypalLink"
                  name="donationPaypalLink"
                  defaultValue={initialSettings.donationPaypalLink}
                  placeholder="https://www.paypal.com/donate/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="donationImage">Donation Page Image</Label>
                <input
                  type="hidden"
                  name="donationImageUrl"
                  value={donationImageUrl}
                />

                {donationImageUrl && (
                  <div className="mb-4 p-4 border rounded-md bg-neutral-100 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={donationImageUrl}
                      alt="Donation Page"
                      className="max-h-[300px] w-auto object-contain"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={donationImageUrl}
                    onChange={(e) => setDonationImageUrl(e.target.value)}
                    placeholder="https://... or /uploads/..."
                  />
                  <MediaBrowser onSelect={setDonationImageUrl} />
                </div>

                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">
                    Or upload directly:
                  </p>
                  <Input
                    id="donationImage"
                    name="donationImage"
                    type="file"
                    accept="image/*"
                  />
                </div>
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
