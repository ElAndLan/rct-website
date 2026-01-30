"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createPage, updatePage } from "@/app/actions/pages";

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PageFormProps {
  initialData?: PageData | null;
}

export function PageForm({ initialData }: PageFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugValue, setSlugValue] = useState(initialData?.slug || "");
  const [titleValue, setTitleValue] = useState(initialData?.title || "");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setTitleValue(title);
    
    // Auto-generate slug for new pages if slug hasn't been manually touched
    if (!initialData && !slugValue) {
        // We don't update slug state here to keep it "empty" so backend generates it,
        // or we can generate it client side for preview.
        // Let's just let the user type it if they want, otherwise backend handles it.
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (initialData) {
        await updatePage(initialData.id, formData);
      } else {
        await createPage(formData);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Page Details</CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                name="title"
                value={titleValue}
                onChange={handleTitleChange}
                required
                placeholder="e.g. About Us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">
                URL Slug (optional)
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground text-sm">/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={slugValue}
                  onChange={(e) => setSlugValue(e.target.value)}
                  placeholder={initialData ? initialData.slug : "leave empty to generate from title"}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                The URL path for this page. Must be unique.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Page Content</Label>
              <Textarea
                id="content"
                name="content"
                defaultValue={initialData?.content}
                required
                placeholder="Write your page content here... (HTML or plain text)"
                className="min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Content is currently rendered as-is (whitespace preserved) or you can use basic HTML tags if the renderer supports it.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="isPublished"
                name="isPublished"
                defaultChecked={initialData?.isPublished}
              />
              <Label htmlFor="isPublished">Publish this page</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Page" : "Create Page"}
          </Button>
        </div>
      </div>
    </form>
  );
}
