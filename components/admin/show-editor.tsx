"use client";

import { useState } from "react";
import {
  ShowWithDetails,
  updateShow,
  addCastMember,
  updateCastMember,
  deleteCastMember,
  uploadShowPhoto,
  deleteShowPhoto,
  updateShowMainImage,
} from "@/app/actions/shows";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Upload, Plus, Save, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ImagePicker } from "./image-picker";
import { Badge } from "@/components/ui/badge";

interface ShowEditorProps {
  show: NonNullable<ShowWithDetails>;
}

export function ShowEditor({ show }: ShowEditorProps) {
  const [activeTab, setActiveTab] = useState<
    "details" | "cast" | "photos" | "program"
  >("details");
  const [isUploading, setIsUploading] = useState(false);
  const [editingMember, setEditingMember] = useState<
    NonNullable<ShowWithDetails>["cast"][number] | null
  >(null);

  // Helper for file uploads to wrap the server action and handle loading state
  const handlePhotoUpload = async (formData: FormData) => {
    setIsUploading(true);
    await uploadShowPhoto(show.id, formData);
    setIsUploading(false);
    // Reset form if needed, but simple file input usually clears on re-render if key changes or manually cleared
    const form = document.getElementById(
      "photo-upload-form",
    ) as HTMLFormElement;
    if (form) form.reset();
  };

  const handleMainImageUpload = async (formData: FormData) => {
    setIsUploading(true);
    await updateShowMainImage(show.id, formData);
    setIsUploading(false);
  };

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b pb-2">
        <Button
          variant={activeTab === "details" ? "default" : "ghost"}
          onClick={() => setActiveTab("details")}
        >
          Details
        </Button>
        <Button
          variant={activeTab === "cast" ? "default" : "ghost"}
          onClick={() => setActiveTab("cast")}
        >
          Cast ({show.cast.length})
        </Button>
        <Button
          variant={activeTab === "photos" ? "default" : "ghost"}
          onClick={() => setActiveTab("photos")}
        >
          Photos ({show.photos.length})
        </Button>
        <Button
          variant={activeTab === "program" ? "default" : "ghost"}
          onClick={() => setActiveTab("program")}
        >
          Program
        </Button>
      </div>

      {/* Content Areas */}

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={updateShow.bind(null, show.id)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={show.title}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                      name="status"
                      id="status"
                      defaultValue={show.status}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="CURRENT">Current (Now Playing)</option>
                      <option value="PAST">Past (Archive)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      type="date"
                      id="startDate"
                      name="startDate"
                      defaultValue={
                        show.startDate
                          ? new Date(show.startDate).toISOString().split("T")[0]
                          : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      type="date"
                      id="endDate"
                      name="endDate"
                      defaultValue={
                        show.endDate
                          ? new Date(show.endDate).toISOString().split("T")[0]
                          : ""
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={show.location || ""}
                    placeholder="e.g. Main Stage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticketLink">Ticket Link</Label>
                  <Input
                    id="ticketLink"
                    name="ticketLink"
                    defaultValue={show.ticketLink || ""}
                    placeholder="https://..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="auditionLink">Audition Link</Label>
                    <Input
                      id="auditionLink"
                      name="auditionLink"
                      defaultValue={show.auditionLink || ""}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volunteerLink">Volunteer Link</Label>
                    <Input
                      id="volunteerLink"
                      name="volunteerLink"
                      defaultValue={show.volunteerLink || ""}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">
                    Short Description (for Cards/Carousel)
                  </Label>
                  <Textarea
                    id="shortDescription"
                    name="shortDescription"
                    defaultValue={show.shortDescription || ""}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Full Description / Synopsis
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={show.description || ""}
                    rows={6}
                  />
                </div>

                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Main Image</CardTitle>
              <CardDescription>
                This image is used for the carousel and show cards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-start">
                {show.imageUrl && (
                  <div className="w-40 h-24 bg-muted rounded-md overflow-hidden relative shrink-0">
                    <img
                      src={show.imageUrl}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <form
                  action={handleMainImageUpload}
                  className="flex-1 space-y-4"
                >
                  <ImagePicker name="image" label="New Main Image" />
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload New Image"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CAST TAB */}
      {activeTab === "cast" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cast Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {show.cast.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        {member.imageUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMember(member)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteCastMember(member.id, show.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {show.cast.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No cast members added yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Cast Member</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={async (formData) => {
                  setIsUploading(true);
                  await addCastMember(show.id, formData);
                  setIsUploading(false);
                  const form = document.getElementById(
                    "add-cast-form",
                  ) as HTMLFormElement;
                  if (form) form.reset();
                }}
                id="add-cast-form"
                className="space-y-4"
              >
                <ImagePicker name="photo" label="Photo (Optional)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cast-name">Name</Label>
                    <Input
                      id="cast-name"
                      name="name"
                      placeholder="Actor Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cast-role">Role</Label>
                    <Input
                      id="cast-role"
                      name="role"
                      placeholder="Character Name"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isUploading}>
                  <Plus className="w-4 h-4 mr-2" />
                  {isUploading ? "Adding..." : "Add Member"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PHOTOS TAB */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Show Photos</CardTitle>
              <CardDescription>Upload photos for the gallery.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {show.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group rounded-md overflow-hidden border bg-muted"
                  >
                    <img
                      src={photo.url}
                      alt="Show photo"
                      className="w-full h-32 object-cover"
                    />
                    <button
                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteShowPhoto(photo.id, show.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Upload New Photo</h4>
                <form
                  id="photo-upload-form"
                  action={handlePhotoUpload}
                  className="space-y-4"
                >
                  <ImagePicker name="photo" label="Photo" />
                  <div className="space-y-2">
                    <Label htmlFor="photo-caption">Caption (Optional)</Label>
                    <Input
                      id="photo-caption"
                      name="caption"
                      placeholder="Description..."
                    />
                  </div>
                  <Button type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* PROGRAM TAB */}
      {activeTab === "program" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Digital Program</CardTitle>
              <CardDescription>
                You can link to a PDF or write the program content here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                action={updateShow.bind(null, show.id)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="programPdfUrl">PDF URL (Optional)</Label>
                  <Input
                    id="programPdfUrl"
                    name="programPdfUrl"
                    defaultValue={show.programPdfUrl || ""}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programContent">
                    Digital Program Content
                  </Label>
                  <Textarea
                    id="programContent"
                    name="programContent"
                    defaultValue={show.programContent || ""}
                    rows={15}
                    placeholder="# Act 1&#10;Scene 1...&#10;&#10;## Cast Bios..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Markdown formatting is supported.
                  </p>
                </div>

                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" /> Save Program
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cast Member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <form
              action={async (formData) => {
                setIsUploading(true);
                await updateCastMember(editingMember.id, show.id, formData);
                setIsUploading(false);
                setEditingMember(null);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                {editingMember.imageUrl && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-muted-foreground">
                      Current Photo:
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <img
                        src={editingMember.imageUrl}
                        alt="Current"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                <ImagePicker name="photo" label="Photo (Optional)" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cast-name">Name</Label>
                <Input
                  id="edit-cast-name"
                  name="name"
                  defaultValue={editingMember.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cast-role">Role</Label>
                <Input
                  id="edit-cast-role"
                  name="role"
                  defaultValue={editingMember.role}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cast-bio">Bio</Label>
                <Textarea
                  id="edit-cast-bio"
                  name="bio"
                  defaultValue={editingMember.bio || ""}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingMember(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
