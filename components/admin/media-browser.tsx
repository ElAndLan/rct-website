"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, Upload, Loader2, Check } from "lucide-react";
import { uploadImage, getUploadedImages } from "@/app/actions/media";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import Image from "next/image";

interface MediaBrowserProps {
  onSelect: (url: string) => void;
  trigger?: React.ReactNode;
}

export function MediaBrowser({ onSelect, trigger }: MediaBrowserProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("library");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Load images when dialog opens or tab changes to library
  useEffect(() => {
    if (open && activeTab === "library") {
      loadImages();
    }
  }, [open, activeTab]);

  async function loadImages() {
    setLoading(true);
    try {
      const result = await getUploadedImages();
      if (result.success && result.images) {
        setImages(result.images);
      } else {
        toast.error("Failed to load images");
      }
    } catch (error) {
      toast.error("An error occurred while loading images");
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      toast.success("Image uploaded successfully");
      onSelect(blob.url);
      setOpen(false); // Close and select
      // Reset tab for next time
      setActiveTab("library");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  }

  function handleSelectImage(url: string) {
    onSelect(url);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <ImageIcon className="mr-2 h-4 w-4" />
            Browse Media
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
          <DialogDescription>
            Browse your uploaded images or upload new ones.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 min-h-0 mt-4">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-lg">
                <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                <p>No images found</p>
                <Button variant="link" onClick={() => setActiveTab("upload")}>
                  Upload one now
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((url) => (
                    <button
                      key={url}
                      className="group relative aspect-video bg-muted rounded-md overflow-hidden border hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      onClick={() => handleSelectImage(url)}
                    >
                      <img
                        src={url}
                        alt="Media"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Check className="text-white h-6 w-6" />
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg bg-muted/10 p-8 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Upload an Image</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Choose a file from your computer to upload to the media library.
              </p>

              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <Button asChild disabled={uploading}>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Select File"
                    )}
                  </Label>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
