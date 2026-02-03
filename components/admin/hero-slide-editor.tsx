"use client";

import { useState, useEffect, useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  GripVertical,
  Trash2,
  Plus,
  Edit,
  Image as ImageIcon,
  ExternalLink,
  Save,
  X,
} from "lucide-react";
import {
  HeroSlideData,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from "@/app/actions/hero-slides";
import { HeroSlide } from "@prisma/client";
import { toast } from "sonner";

import { MediaBrowser } from "./media-browser";

// Sortable Item Component
function SortableSlideItem({
  slide,
  onEdit,
  onDelete,
}: {
  slide: HeroSlide;
  onEdit: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-md mb-2 overflow-hidden"
    >
      <div className="flex items-center p-3 gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move text-muted-foreground hover:text-foreground"
        >
          <GripVertical size={20} />
        </button>

        <div className="h-12 w-20 bg-muted rounded overflow-hidden relative shrink-0">
          {slide.imageUrl ? (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <ImageIcon size={16} className="text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{slide.title}</h4>
          <p className="text-xs text-muted-foreground truncate">
            {slide.subtitle || "No subtitle"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${slide.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
          >
            {slide.isActive ? "Active" : "Inactive"}
          </div>

          <Button variant="ghost" size="icon" onClick={() => onEdit(slide)}>
            <Edit size={16} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(slide.id)}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function HeroSlideEditor() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<HeroSlideData>({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkText: "",
    linkUrl: "",
    secondaryLinkText: "",
    secondaryLinkUrl: "",
    isActive: true,
  });

  const dndContextId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    loadSlides();
  }, []);

  async function loadSlides() {
    setLoading(true);
    const result = await getHeroSlides();
    if (result.success && result.slides) {
      setSlides(result.slides);
    } else {
      toast.error("Failed to load slides");
    }
    setLoading(false);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Save new order to backend
        const orderUpdate = newItems.map((item, index) => ({
          id: item.id,
          order: index,
        }));
        reorderHeroSlides(orderUpdate);

        return newItems;
      });
    }
  }

  function handleEdit(slide: HeroSlide) {
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl,
      linkText: slide.linkText || "",
      linkUrl: slide.linkUrl || "",
      isActive: slide.isActive,
    });
    setEditingId(slide.id);
    setIsEditing(true);
  }

  function handleAddNew() {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkText: "",
      linkUrl: "",
      isActive: true,
    });
    setEditingId(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingId) {
      const result = await updateHeroSlide(editingId, formData);
      if (result.success) {
        toast.success("Slide updated");
        loadSlides();
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to update slide");
      }
    } else {
      const result = await createHeroSlide(formData);
      if (result.success) {
        toast.success("Slide created");
        loadSlides();
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to create slide");
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this slide?")) {
      const result = await deleteHeroSlide(id);
      if (result.success) {
        toast.success("Slide deleted");
        loadSlides();
      } else {
        toast.error("Failed to delete slide");
      }
    }
  }

  if (loading) return <div>Loading slides...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* List Section */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Current Slides</h2>
          <Button onClick={handleAddNew} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Slide
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {slides.length === 0 ? (
                <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                  No slides found. Add one to get started.
                </div>
              ) : (
                slides.map((slide) => (
                  <SortableSlideItem
                    key={slide.id}
                    slide={slide}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Editor Section */}
      <div className="lg:col-span-1">
        {isEditing ? (
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Slide" : "New Slide"}</CardTitle>
              <CardDescription>Configure your carousel slide.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Now Showing"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    placeholder="e.g. Get your tickets today!"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://... or /uploads/..."
                      required
                    />
                    <MediaBrowser
                      onSelect={(url) =>
                        setFormData({ ...formData, imageUrl: url })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1920x600px
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkText">Primary Button Text</Label>
                    <Input
                      id="linkText"
                      value={formData.linkText || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, linkText: e.target.value })
                      }
                      placeholder="e.g. Buy Tickets"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">Primary Button URL</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, linkUrl: e.target.value })
                      }
                      placeholder="/tickets"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryLinkText">
                      Secondary Button Text
                    </Label>
                    <Input
                      id="secondaryLinkText"
                      value={formData.secondaryLinkText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondaryLinkText: e.target.value,
                        })
                      }
                      placeholder="e.g. Learn More"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryLinkUrl">
                      Secondary Button URL
                    </Label>
                    <Input
                      id="secondaryLinkUrl"
                      value={formData.secondaryLinkUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondaryLinkUrl: e.target.value,
                        })
                      }
                      placeholder="/shows/..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border rounded-md px-3">
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active
                  </Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1">
                    <Save className="mr-2 h-4 w-4" /> Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
              <p>Select a slide to edit or create a new one.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
