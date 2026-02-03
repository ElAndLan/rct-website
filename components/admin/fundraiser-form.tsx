"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ImagePicker } from "@/components/admin/image-picker";
import { Plus, Trash2, Calendar } from "lucide-react";
import {
  FundraiserWithEvents,
  createFundraiser,
  updateFundraiser,
} from "@/app/actions/fundraisers";
import { format } from "date-fns";
import { formatZipCode } from "@/lib/formatters";

interface FundraiserFormProps {
  initialData?: FundraiserWithEvents;
}

export function FundraiserForm({ initialData }: FundraiserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<
    { startTime: string; endTime: string }[]
  >(
    initialData?.events.map((e) => ({
      startTime: new Date(e.startTime).toISOString().slice(0, 16), // datetime-local format
      endTime: e.endTime ? new Date(e.endTime).toISOString().slice(0, 16) : "",
    })) || [],
  );

  const addEvent = () => {
    setEvents([...events, { startTime: "", endTime: "" }]);
  };

  const removeEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const updateEvent = (
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    // Add events as JSON
    formData.set("events", JSON.stringify(events));

    try {
      if (initialData) {
        await updateFundraiser(initialData.id, formData);
      } else {
        await createFundraiser(formData);
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
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={initialData?.title}
                  required
                  placeholder="e.g. Spring Gala 2026"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={initialData?.shortDescription}
                  required
                  placeholder="A brief summary for the card view..."
                  className="h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={initialData?.description}
                  required
                  placeholder="Full details about the fundraiser..."
                  className="h-40"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  name="isActive"
                  value="true"
                  defaultChecked={initialData?.isActive ?? true}
                />
                <Label htmlFor="isActive">Active (Visible to public)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Schedule
              </h3>

              <div className="space-y-4">
                {events.map((event, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end border p-3 rounded-md bg-muted/20"
                  >
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Start Time</Label>
                      <Input
                        type="datetime-local"
                        value={event.startTime}
                        onChange={(e) =>
                          updateEvent(index, "startTime", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">End Time (Optional)</Label>
                      <Input
                        type="datetime-local"
                        value={event.endTime}
                        onChange={(e) =>
                          updateEvent(index, "endTime", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/90"
                      onClick={() => removeEvent(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEvent}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Date/Time
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <ImagePicker
                name="image"
                label="Cover Image"
                defaultValue={initialData?.imageUrl}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Location Details</h3>

              <div className="space-y-2">
                <Label htmlFor="locationName">Location Name</Label>
                <Input
                  id="locationName"
                  name="locationName"
                  defaultValue={initialData?.locationName || ""}
                  placeholder="e.g. The Grand Ballroom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={initialData?.address || ""}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={initialData?.city || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    defaultValue={initialData?.state || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">Zip Code</Label>
                <Input
                  id="zip"
                  name="zip"
                  defaultValue={initialData?.zip || ""}
                  onChange={(e) => {
                    e.target.value = formatZipCode(e.target.value);
                  }}
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
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Fundraiser"
              : "Create Fundraiser"}
        </Button>
      </div>
    </form>
  );
}
