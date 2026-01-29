"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUploadedFiles } from "@/app/actions/media";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

interface ImagePickerProps {
  name: string;
  label?: string;
  defaultValue?: string | null;
}

export function ImagePicker({ name, label = "Photo", defaultValue }: ImagePickerProps) {
  const [activeTab, setActiveTab] = useState("upload");
  const [libraryImages, setLibraryImages] = useState<string[]>([]);
  const [selectedLibraryImage, setSelectedLibraryImage] = useState<string | null>(null);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  useEffect(() => {
    if (activeTab === "library" && libraryImages.length === 0) {
      setIsLoadingLibrary(true);
      getUploadedFiles()
        .then((files) => {
          setLibraryImages(files);
          setIsLoadingLibrary(false);
        })
        .catch(() => setIsLoadingLibrary(false));
    }
  }, [activeTab, libraryImages.length]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="pt-2">
          <Input type="file" name={name} accept="image/*" />
          <p className="text-xs text-muted-foreground mt-1">
            Upload a new image from your device.
          </p>
        </TabsContent>

        <TabsContent value="url" className="pt-2">
          <Input
            type="text"
            name={`${name}_url`}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter a direct URL to an image. It will be downloaded and saved.
          </p>
        </TabsContent>

        <TabsContent value="library" className="pt-2">
          <input
            type="hidden"
            name={`${name}_existing`}
            value={selectedLibraryImage || ""}
          />

          <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            {isLoadingLibrary ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Loading images...
              </div>
            ) : libraryImages.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No images found.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {libraryImages.map((src) => (
                  <div
                    key={src}
                    className={`relative aspect-square cursor-pointer rounded-md overflow-hidden border-2 ${
                      selectedLibraryImage === src
                        ? "border-primary"
                        : "border-transparent"
                    } hover:opacity-90 transition-opacity`}
                    onClick={() => setSelectedLibraryImage(src)}
                  >
                    <img
                      src={src}
                      alt="Library"
                      className="object-cover w-full h-full"
                    />
                    {selectedLibraryImage === src && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="text-white w-6 h-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {selectedLibraryImage && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              Selected: {selectedLibraryImage}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
