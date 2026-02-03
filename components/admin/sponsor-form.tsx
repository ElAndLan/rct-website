"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImagePicker } from "@/components/admin/image-picker";
import { createSponsor, updateSponsor } from "@/app/actions/sponsors";
import { useRouter } from "next/navigation";
import { formatPhoneNumber } from "@/lib/formatters";

interface SponsorFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    websiteUrl: string | null;
    email: string | null;
    phone: string | null;
    isActive: boolean;
    order: number;
  };
}

export function SponsorForm({ initialData }: SponsorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState(initialData?.phone || "");
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (initialData) {
        result = await updateSponsor(initialData.id, formData);
      } else {
        result = await createSponsor(formData);
      }

      if (result.success) {
        router.push("/admin/sponsors");
      } else {
        console.error(result.error);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={initialData?.name}
                  required
                  placeholder="Sponsor Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={initialData?.description || ""}
                  placeholder="Brief description of the sponsor..."
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  defaultValue={initialData?.websiteUrl || ""}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={initialData?.email || ""}
                    placeholder="contact@sponsor.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="order">Sort Order</Label>
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    defaultValue={initialData?.order || 0}
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first
                  </p>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="isActive"
                    name="isActive"
                    defaultChecked={initialData?.isActive ?? true}
                    value="true"
                  />
                  <Label htmlFor="isActive">Active (Visible)</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Sponsor Logo</Label>
                <ImagePicker
                  name="image"
                  defaultImage={initialData?.imageUrl || undefined}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Sponsor"
              : "Create Sponsor"}
        </Button>
      </div>
    </form>
  );
}
