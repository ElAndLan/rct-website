import {
  getAuditionSlots,
  generateSlots,
  deleteSlot,
} from "@/app/actions/auditions";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Clock, Trash2, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { redirect } from "next/navigation";

export default async function AuditionSlotManagerPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await prisma.auditionEvent.findUnique({
    where: { id: params.id },
  });

  if (!event) redirect("/admin/auditions");

  const slots = await getAuditionSlots(params.id);

  // Group slots by date for display
  const slotsByDate = slots.reduce(
    (acc, slot) => {
      const dateKey = format(slot.startTime, "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(slot);
      return acc;
    },
    {} as Record<string, typeof slots>,
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/auditions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {event.title} - Slot Manager
          </h1>
          <p className="text-muted-foreground">
            Generate time slots for auditionees to sign up.
          </p>
        </div>
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Bulk Slot Generator</CardTitle>
          <CardDescription>
            Automatically create multiple slots for a specific day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={generateSlots.bind(null, event.id)}
            className="flex flex-wrap items-end gap-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                id="date"
                name="date"
                required
                className="w-[160px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                name="startTime"
                defaultValue="09:00"
                required
                className="w-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                name="endTime"
                defaultValue="17:00"
                required
                className="w-[120px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (mins)</Label>
              <Input
                type="number"
                id="duration"
                name="duration"
                defaultValue="30"
                min="5"
                required
                className="w-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Slots per time</Label>
              <Input
                type="number"
                id="capacity"
                name="capacity"
                defaultValue="1"
                min="1"
                max="10"
                required
                className="w-[100px]"
              />
            </div>
            <Button type="submit">Generate Slots</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-8">
        {Object.entries(slotsByDate)
          .sort()
          .map(([date, daySlots]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2 z-10 border-b">
                {format(new Date(date), "EEEE, MMMM do, yyyy")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daySlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="border rounded-lg p-3 flex justify-between items-start bg-card shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-medium">
                        <Clock size={14} className="text-muted-foreground" />
                        {format(slot.startTime, "h:mm a")} -{" "}
                        {format(slot.endTime, "h:mm a")}
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <User size={12} />
                          <span>
                            {slot.signups.length} / {slot.capacity} filled
                          </span>
                        </div>
                        {slot.signups.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {slot.signups.map((s) => (
                              <li
                                key={s.id}
                                className="text-xs bg-muted p-1 rounded"
                              >
                                {s.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                    <form action={deleteSlot.bind(null, slot.id)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          ))}

        {slots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No slots created yet. Use the generator above to add some.
          </div>
        )}
      </div>
    </div>
  );
}
