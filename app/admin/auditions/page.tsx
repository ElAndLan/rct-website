
import { getAuditionEvents, createAuditionEvent } from "@/app/actions/auditions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CalendarDays, MapPin, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function AuditionEventsPage() {
  const events = await getAuditionEvents()

  return (
    <div className="space-y-6 max-w-6xl">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audition Events</h1>
                <p className="text-muted-foreground">Manage audition dates and sign-up slots.</p>
            </div>
            
            <Dialog>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4"/> Create Event</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Audition Event</DialogTitle>
                        <DialogDescription>
                            Define the overall event. You will add time slots in the next step.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={createAuditionEvent}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">Title</Label>
                                <Input id="title" name="title" placeholder="e.g. Fall Musical Auditions" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="location" className="text-right">Location</Label>
                                <Input id="location" name="location" placeholder="Main Stage" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="startDate" className="text-right">Start Date</Label>
                                <Input type="date" id="startDate" name="startDate" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="endDate" className="text-right">End Date</Label>
                                <Input type="date" id="endDate" name="endDate" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right pt-2">Details</Label>
                                <Textarea id="description" name="description" className="col-span-3" placeholder="What to prepare..." />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Create & Manage Slots</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <div className="grid gap-4">
            {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                            <div className="flex items-center text-sm text-muted-foreground gap-4">
                                <span className="flex items-center gap-1"><CalendarDays size={14} /> {format(event.startDate, 'MMM d, yyyy')} - {format(event.endDate, 'MMM d, yyyy')}</span>
                                {event.location && <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>}
                            </div>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/auditions/${event.id}`}>
                                Manage Slots <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{event.description}</p>
                        <div className="text-xs font-medium bg-muted inline-block px-2 py-1 rounded-md">
                            {event._count.slots} Time Slots Created
                        </div>
                    </CardContent>
                </Card>
            ))}
            
            {events.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
                    No audition events found. Create one to get started.
                </div>
            )}
        </div>
    </div>
  )
}
