"use client";

import { useState } from "react";
import { submitVolunteerApplication } from "@/app/actions/volunteer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { formatPhoneNumber } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VOLUNTEER_ROLES = [
  "Stage Crew",
  "Prop Development",
  "Costume Design",
  "Make-up/Hair",
  "Sound Crew",
  "Lighting",
  "Concessions",
  "Ushering",
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIMES = ["Any", "Morning", "Afternoon", "Evening"];

export default function VolunteerPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState<Record<string, string[]>>(
    {},
  );

  const toggleDay = (day: string) => {
    setAvailability((prev) => {
      if (prev[day]) {
        const { [day]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [day]: [] };
    });
  };

  const toggleTime = (day: string, time: string) => {
    setAvailability((prev) => {
      const currentTimes = prev[day] || [];

      // If selecting "Any", clear others and set only "Any"
      // If "Any" was already selected, deselect it
      if (time === "Any") {
        if (currentTimes.includes("Any")) {
          return { ...prev, [day]: [] };
        }
        return { ...prev, [day]: ["Any"] };
      }

      // If selecting specific time, remove "Any" if present
      let newTimes = currentTimes.filter((t) => t !== "Any");

      if (newTimes.includes(time)) {
        newTimes = newTimes.filter((t) => t !== time);
      } else {
        newTimes.push(time);
      }

      return { ...prev, [day]: newTimes };
    });
  };

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);

    // Client-side validation for roles (at least one)
    const roles = formData.getAll("roles");
    if (roles.length === 0) {
      toast.error("Please select at least one role.");
      setIsSubmitting(false);
      return;
    }

    // Serialize availability
    const availabilityString = Object.entries(availability)
      .map(([day, times]) => {
        if (times.length === 0) return `${day}: Any`;
        return `${day}: ${times.join(", ")}`;
      })
      .join("\n");

    formData.set("availability", availabilityString);

    const result = await submitVolunteerApplication(formData);

    if (result.success) {
      toast.success("Application submitted! We'll be in touch soon.");
      // Reset form
      const form = document.getElementById("volunteer-form") as HTMLFormElement;
      form.reset();
      setAvailability({});
      setPhone("");
    } else {
      toast.error(result.error || "Something went wrong.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Volunteer With Us
          </CardTitle>
          <CardDescription className="text-center text-lg mt-2">
            Join our community! We are always looking for passionate individuals
            to help bring our productions to life.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="volunteer-form" action={handleSubmit} className="space-y-8">
            {/* Contact Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Contact Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) =>
                      setPhone(formatPhoneNumber(e.target.value))
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * Please provide at least one contact method (Email or Phone).
              </p>
            </div>

            {/* About You */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">About You</h3>

              <div className="space-y-2">
                <Label htmlFor="about">Tell us about yourself</Label>
                <Textarea
                  id="about"
                  name="about"
                  placeholder="Experience, interests, or why you want to join..."
                  rows={4}
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Availability
              </h3>
              <p className="text-sm text-muted-foreground">
                Select the days you are available, then specify times.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {DAYS.map((day) => {
                  const isSelected = day in availability;
                  return (
                    <Button
                      key={day}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "w-full h-auto py-3 px-1 text-sm transition-all",
                        isSelected && "ring-2 ring-primary ring-offset-2",
                      )}
                      onClick={() => toggleDay(day)}
                    >
                      {day}
                    </Button>
                  );
                })}
              </div>

              {/* Time Slots for Selected Days */}
              {Object.keys(availability).length > 0 && (
                <div className="mt-4 space-y-4 border rounded-md p-4 bg-muted/20">
                  {DAYS.filter((d) => d in availability).map((day) => (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 border-b last:border-0 pb-3 last:pb-0"
                    >
                      <span className="font-medium w-24 shrink-0">{day}</span>
                      <div className="flex flex-wrap gap-3">
                        {TIMES.map((time) => (
                          <div
                            key={time}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`time-${day}-${time}`}
                              checked={availability[day]?.includes(time)}
                              onCheckedChange={() => toggleTime(day, time)}
                            />
                            <Label
                              htmlFor={`time-${day}-${time}`}
                              className="cursor-pointer font-normal"
                            >
                              {time}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Roles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Roles of Interest
              </h3>
              <p className="text-sm text-muted-foreground">
                Select all that apply.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VOLUNTEER_ROLES.map((role) => (
                  <div key={role} className="flex items-center space-x-2">
                    <Checkbox id={`role-${role}`} name="roles" value={role} />
                    <Label htmlFor={`role-${role}`} className="cursor-pointer">
                      {role}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Comments */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalComments">Additional Comments</Label>
                <Textarea
                  id="additionalComments"
                  name="additionalComments"
                  placeholder="Any questions or special skills?"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
