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

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logoUrl || "");
  const [headerBannerUrl, setHeaderBannerUrl] = useState(
    initialSettings.headerBannerUrl || "",
  );
  const [footerLinks, setFooterLinks] = useState<
    { label: string; url: string }[]
  >(initialSettings.footerLinks ? JSON.parse(initialSettings.footerLinks) : []);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    // Append footerLinks as JSON string
    formData.set("footerLinks", JSON.stringify(footerLinks));

    const result = await updateSiteSettings(formData);
    setIsSubmitting(false);

    if (result.success) {
      alert("Settings updated successfully!");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  const addFooterLink = () => {
    setFooterLinks([...footerLinks, { label: "", url: "" }]);
  };

  const removeFooterLink = (index: number) => {
    const newLinks = [...footerLinks];
    newLinks.splice(index, 1);
    setFooterLinks(newLinks);
  };

  const updateFooterLink = (
    index: number,
    field: "label" | "url",
    value: string,
  ) => {
    const newLinks = [...footerLinks];
    newLinks[index][field] = value;
    setFooterLinks(newLinks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage global site settings, branding, and footer content.
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
              {logoUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setLogoUrl("")}
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="mt-2">
              <p className="text-sm font-medium mb-1">Or upload directly:</p>
              <Input id="logo" name="logo" type="file" accept="image/*" />
            </div>

            <p className="text-sm text-muted-foreground mt-2">
              Recommended resolution: 214px by 118px.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headerBanner">Header Banner Image (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              This image will appear below the navigation bar on every page.
              Leave empty to hide.
            </p>

            {/* Hidden Input for Form Data */}
            <input
              type="hidden"
              name="headerBannerUrl"
              value={headerBannerUrl}
            />

            {headerBannerUrl && (
              <div className="mb-4 p-4 border rounded-md bg-neutral-100 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={headerBannerUrl}
                  alt="Header Banner"
                  className="max-h-[100px] w-auto object-contain"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Input
                id="headerBannerUrlDisplay"
                value={headerBannerUrl}
                onChange={(e) => setHeaderBannerUrl(e.target.value)}
                placeholder="https://... or /uploads/..."
              />
              <MediaBrowser onSelect={setHeaderBannerUrl} />
              {headerBannerUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setHeaderBannerUrl("")}
                >
                  Clear
                </Button>
              )}
            </div>
            <Input
              id="headerBanner"
              name="headerBanner"
              type="file"
              accept="image/*"
              className="mt-2"
            />
          </div>

          <div className="space-y-2 pt-6 border-t">
            <h3 className="text-lg font-semibold">Footer Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage the content displayed in the site footer.
            </p>

            <div className="grid gap-6">
              {/* Footer Description */}
              <div className="space-y-2">
                <Label htmlFor="footerDescription">About Text</Label>
                <textarea
                  id="footerDescription"
                  name="footerDescription"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue={initialSettings.footerDescription}
                  placeholder="Bringing the arts to life in our community."
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <Label>Contact Information</Label>
                <div className="grid gap-2">
                  <Input
                    name="contactAddress1"
                    defaultValue={initialSettings.contactAddress1}
                    placeholder="Address Line 1 (e.g. 123 Theatre Lane)"
                  />
                  <Input
                    name="contactAddress2"
                    defaultValue={initialSettings.contactAddress2}
                    placeholder="Address Line 2 (e.g. Cityville, ST 12345)"
                  />
                  <Input
                    name="contactEmail"
                    defaultValue={initialSettings.contactEmail}
                    placeholder="Email Address"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-2">
                <Label>Social Media Links</Label>
                <div className="grid gap-2">
                  <Input
                    name="socialFacebook"
                    defaultValue={initialSettings.socialFacebook}
                    placeholder="Facebook URL"
                  />
                  <Input
                    name="socialInstagram"
                    defaultValue={initialSettings.socialInstagram}
                    placeholder="Instagram URL"
                  />
                </div>
              </div>

              {/* Copyright */}
              <div className="space-y-2">
                <Label htmlFor="footerCopyright">Copyright Text</Label>
                <Input
                  id="footerCopyright"
                  name="footerCopyright"
                  defaultValue={initialSettings.footerCopyright}
                  placeholder="Reading Civic Theatre. All rights reserved."
                />
              </div>

              {/* Custom Links */}
              <div className="space-y-2">
                <Label>Custom Footer Links</Label>
                <div className="space-y-2">
                  {footerLinks.map((link, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={link.label}
                        onChange={(e) =>
                          updateFooterLink(index, "label", e.target.value)
                        }
                        placeholder="Link Label"
                        className="flex-1"
                      />
                      <Input
                        value={link.url}
                        onChange={(e) =>
                          updateFooterLink(index, "url", e.target.value)
                        }
                        placeholder="URL (e.g. /about or https://...)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeFooterLink(index)}
                      >
                        <span className="sr-only">Remove</span>
                        &times;
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFooterLink}
                    className="mt-2"
                  >
                    + Add Link
                  </Button>
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
