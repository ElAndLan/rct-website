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

export function ContactInfoForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(formData: FormData) {
    setIsSubmitting(true);
    const result = await updateSiteSettings(formData);
    setIsSubmitting(false);

    if (result.success) {
      alert("Contact information updated successfully!");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Page Information</CardTitle>
        <CardDescription>
          Configure the content and settings for the /contact page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={onSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPageTitle">Page Title / Header</Label>
              <Input
                id="contactPageTitle"
                name="contactPageTitle"
                defaultValue={initialSettings.contactPageTitle}
                placeholder="Contact Us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPageBody">
                Page Body (Markdown Supported)
              </Label>
              <textarea
                id="contactPageBody"
                name="contactPageBody"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                defaultValue={initialSettings.contactPageBody}
                placeholder="We'd love to hear from you! Please fill out the form below..."
              />
              <p className="text-xs text-muted-foreground">
                You can use Markdown for formatting (e.g., **bold**, *italic*, -
                list).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNotificationEmail">
                Notification Email
              </Label>
              <Input
                id="contactNotificationEmail"
                name="contactNotificationEmail"
                defaultValue={initialSettings.contactNotificationEmail}
                placeholder="admin@readingcivictheatre.com"
              />
              <p className="text-xs text-muted-foreground">
                Submissions will be sent to this email address.
              </p>
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
