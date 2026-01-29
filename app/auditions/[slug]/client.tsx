"use client";

import { useState } from "react";
import { format, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Clock, MapPin, Calendar as CalendarIcon, Info } from "lucide-react";
import { toast } from "sonner";
import { bookAuditionSlot } from "@/app/actions/audition";
import { cn } from "@/lib/utils";

type Slot = {
  id: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  attendeeCount: number;
};

type Props = {
  showTitle: string;
  description: string | null;
  location: string | null;
  slots: Slot[];
};

export function PublicAuditionClient({ showTitle, description, location, slots }: Props) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter slots for selected date
  const slotsForDate = slots
    .filter((slot) => date && isSameDay(new Date(slot.startTime), date))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  // Get dates that have available slots
  const availableDates = slots
    .filter(s => s.attendeeCount < s.capacity)
    .map(s => new Date(s.startTime));

  const handleBookClick = (slot: Slot) => {
    setSelectedSlot(slot);
    setIsBookingOpen(true);
  };

  const handleSubmit = async (formData: FormData) => {
    if (!selectedSlot) return;
    setIsSubmitting(true);

    const result = await bookAuditionSlot({
      slotId: selectedSlot.id,
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      desiredRole: formData.get("desiredRole") as string,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Audition booked successfully! Check your email for details.");
      setIsBookingOpen(false);
      // Optional: Refresh or update local state
    } else {
      toast.error(result.error || "Failed to book audition");
    }
  };

  return (
    <div className="container py-12 max-w-5xl mx-auto">
      <div className="text-center mb-10 space-y-4">
        <h1 className="text-4xl font-bold">Auditions: {showTitle}</h1>
        {location && (
          <div className="flex items-center justify-center text-muted-foreground">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{location}</span>
          </div>
        )}
        {description && (
          <div className="max-w-2xl mx-auto p-4 bg-muted/50 rounded-lg text-left">
            <h3 className="font-semibold mb-2 flex items-center">
              <Info className="w-4 h-4 mr-2" /> Important Information
            </h3>
            <p className="whitespace-pre-wrap text-sm">{description}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Calendar Section */}
        <div className="md:col-span-5 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Select a Date</CardTitle>
              <CardDescription>
                Dates with available slots are highlighted.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  available: availableDates,
                }}
                modifiersStyles={{
                  available: { fontWeight: "bold", textDecoration: "underline", color: "var(--primary)" }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Slots Section */}
        <div className="md:col-span-7 lg:col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {date ? format(date, "EEEE, MMMM do") : "Select a date"}
              </CardTitle>
              <CardDescription>
                Available time slots for the selected date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!date ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <CalendarIcon className="w-10 h-10 mb-2 opacity-20" />
                  <p>Please select a date from the calendar to view slots.</p>
                </div>
              ) : slotsForDate.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No auditions scheduled for this date.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {slotsForDate.map((slot) => {
                    const isFull = slot.attendeeCount >= slot.capacity;
                    const spotsLeft = slot.capacity - slot.attendeeCount;

                    return (
                      <div
                        key={slot.id}
                        className={cn(
                          "border rounded-lg p-4 transition-all hover:border-primary",
                          isFull ? "opacity-60 bg-muted" : "bg-card"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center font-semibold">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            {format(new Date(slot.startTime), "h:mm a")}
                          </div>
                          <Badge variant={isFull ? "destructive" : "secondary"}>
                            {isFull ? "Full" : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          Until {format(new Date(slot.endTime), "h:mm a")}
                        </div>
                        <Button 
                          className="w-full" 
                          disabled={isFull}
                          onClick={() => handleBookClick(slot)}
                        >
                          {isFull ? "Fully Booked" : "Book Slot"}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Audition Booking</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <span>
                  {format(new Date(selectedSlot.startTime), "PPP")} at{" "}
                  {format(new Date(selectedSlot.startTime), "h:mm a")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <form action={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input id="fullName" name="fullName" required placeholder="Jane Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" type="tel" placeholder="(555) 123-4567" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
                * Either Email or Phone is required.
            </p>

            <div className="space-y-2">
              <Label htmlFor="desiredRole">Desired Role(s)</Label>
              <Textarea 
                id="desiredRole" 
                name="desiredRole" 
                placeholder="e.g. Lead, Ensemble, or any..." 
                rows={3}
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
