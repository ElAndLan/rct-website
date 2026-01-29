"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Plus,
  Users,
  MapPin,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  upsertAudition,
  generateAuditionSlots,
  deleteAuditionSlot,
  cancelAuditionBooking,
} from "@/app/actions/audition";

// --- Types ---
type Audition = {
  id: string;
  description: string | null;
  location: string | null;
  isActive: boolean;
};

type AuditionSlot = {
  id: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  _count: { attendees: number };
  attendees: AuditionAttendee[];
};

type AuditionAttendee = {
  id: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  desiredRole: string | null;
  createdAt: Date;
};

type ClientProps = {
  showId: string;
  initialAudition: Audition | null;
  slots: AuditionSlot[];
};

export function AuditionManager({
  showId,
  initialAudition,
  slots,
}: ClientProps) {
  // State for Settings
  const [description, setDescription] = useState(
    initialAudition?.description || "",
  );
  const [location, setLocation] = useState(initialAudition?.location || "");
  const [isActive, setIsActive] = useState(initialAudition?.isActive ?? true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // State for Slot Generation
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("21:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [capacity, setCapacity] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AuditionSlot | null>(null);
  const [isViewAttendeesOpen, setIsViewAttendeesOpen] = useState(false);
  const router = useRouter();

  // --- Handlers ---

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const result = await upsertAudition(showId, {
      description,
      location,
      isActive,
    });
    setIsSavingSettings(false);

    if (result.success) {
      toast.success("Settings saved successfully");
    } else {
      toast.error(result.error || "Failed to save settings");
    }
  };

  const handleGenerateSlots = async () => {
    if (!initialAudition?.id) {
      // Must save settings first to create the audition record
      toast.error("Please save settings to initialize the audition first.");
      return;
    }
    if (!date) {
      toast.error("Please select a date.");
      return;
    }

    setIsGenerating(true);
    const result = await generateAuditionSlots({
      auditionId: initialAudition.id,
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime,
      slotDuration: Number(slotDuration),
      capacity: Number(capacity),
    });
    setIsGenerating(false);

    if (result.success) {
      toast.success(`Generated ${result.count} slots`);
      setIsDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to generate slots");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this slot?")) return;
    const result = await deleteAuditionSlot(slotId);
    if (result.success) {
      toast.success("Slot deleted");
    } else {
      toast.error(result.error);
    }
  };

  const handleCancelBooking = async (attendeeId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this booking? This action cannot be undone.",
      )
    )
      return;

    const result = await cancelAuditionBooking(attendeeId);
    if (result.success) {
      toast.success("Booking cancelled successfully");

      // Update local state to remove the attendee immediately from the view
      if (selectedSlot) {
        setSelectedSlot({
          ...selectedSlot,
          attendees: selectedSlot.attendees.filter((a) => a.id !== attendeeId),
          _count: {
            attendees: Math.max(0, selectedSlot._count.attendees - 1),
          },
        });
      }
      router.refresh();
    } else {
      toast.error(result.error || "Failed to cancel booking");
    }
  };

  // Group slots by date
  const groupedSlots = slots.reduce(
    (acc, slot) => {
      const dateKey = format(new Date(slot.startTime), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slot);
      return acc;
    },
    {} as Record<string, AuditionSlot[]>,
  );

  // Sort dates
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="space-y-8">
      {/* Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle>Audition Settings</CardTitle>
          <CardDescription>
            Configure general information for this production's auditions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="active-mode"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="active-mode">Auditions Active</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="e.g. Main Stage"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Requirements / Info</Label>
              <div className="relative">
                <FileText className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Textarea
                  className="pl-8 min-h-[100px]"
                  placeholder="What to bring, dress code, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
            {isSavingSettings ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Slots Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Audition Slots</CardTitle>
            <CardDescription>Manage available time slots.</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" /> Add Slots
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Slots</DialogTitle>
                <DialogDescription>
                  Create multiple 30-minute slots for a specific day.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duration (min)</Label>
                    <Input
                      type="number"
                      value={slotDuration}
                      onChange={(e) => setSlotDuration(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerateSlots}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Slots"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No slots created yet. Click "Add Slots" to get started.
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
                    {format(
                      new Date(dateKey + "T00:00:00"),
                      "EEEE, MMMM do, yyyy",
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {groupedSlots[dateKey]
                      .sort(
                        (a, b) =>
                          new Date(a.startTime).getTime() -
                          new Date(b.startTime).getTime(),
                      )
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded border text-sm"
                        >
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
                            <span>
                              {format(new Date(slot.startTime), "h:mm a")} -{" "}
                              {format(new Date(slot.endTime), "h:mm a")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={
                                slot.attendees.length > 0
                                  ? "secondary"
                                  : "ghost"
                              }
                              size="sm"
                              className={cn(
                                "h-7 text-xs",
                                slot.attendees.length > 0 &&
                                  "bg-blue-100 text-blue-700 hover:bg-blue-200",
                              )}
                              onClick={() => {
                                setSelectedSlot(slot);
                                setIsViewAttendeesOpen(true);
                              }}
                            >
                              <Users className="w-3 h-3 mr-1" />
                              {slot._count.attendees} / {slot.capacity}
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive/90"
                              onClick={() => handleDeleteSlot(slot.id)}
                              title="Delete Slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Attendees Dialog */}
      <Dialog open={isViewAttendeesOpen} onOpenChange={setIsViewAttendeesOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audition Attendees</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <span>
                  {format(new Date(selectedSlot.startTime), "PPP")} &bull;{" "}
                  {format(new Date(selectedSlot.startTime), "h:mm a")} -{" "}
                  {format(new Date(selectedSlot.endTime), "h:mm a")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && selectedSlot.attendees.length > 0 ? (
            <div className="space-y-4">
              {selectedSlot.attendees.map((attendee) => (
                <div
                  key={attendee.id}
                  className="border rounded-md p-4 space-y-2 bg-card"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        {attendee.fullName}
                      </h4>
                      <div className="text-sm text-muted-foreground flex flex-col gap-1">
                        {attendee.email && (
                          <span className="flex items-center gap-2">
                            📧 {attendee.email}
                          </span>
                        )}
                        {attendee.phoneNumber && (
                          <span className="flex items-center gap-2">
                            📞 {attendee.phoneNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-muted-foreground">
                        Booked:{" "}
                        {format(new Date(attendee.createdAt), "MMM d, h:mm a")}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelBooking(attendee.id)}
                      >
                        Cancel Booking
                      </Button>
                    </div>
                  </div>

                  {attendee.desiredRole && (
                    <div className="pt-2 border-t mt-2">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Desired Role / Notes
                      </span>
                      <p className="text-sm whitespace-pre-wrap mt-1">
                        {attendee.desiredRole}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No attendees found for this slot.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
