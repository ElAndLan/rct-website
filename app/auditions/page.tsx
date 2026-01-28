
import { getAuditionEvents, getAuditionSlots } from "@/app/actions/auditions"
import { signupForAudition } from "@/app/actions/public-auditions"
import PublicLayout from "@/components/layout/PublicLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react"

export default async function PublicAuditionsPage() {
  const events = await getAuditionEvents()
  
  // For the MVP, we'll just show the first active event. 
  // In a full build, this would be a list or a dynamic route /auditions/[id]
  const activeEvent = events.find(e => e.isActive)
  
  if (!activeEvent) {
      return (
          <PublicLayout>
              <div className="container mx-auto px-4 py-20 text-center">
                  <h1 className="text-4xl font-bold mb-4">Auditions</h1>
                  <p className="text-muted-foreground text-lg">There are currently no open auditions. Please check back later!</p>
              </div>
          </PublicLayout>
      )
  }

  const slots = await getAuditionSlots(activeEvent.id)
  
  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const dateKey = format(slot.startTime, 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(slot)
    return acc
  }, {} as Record<string, typeof slots>)

  return (
    <PublicLayout>
        <div className="bg-muted/30 py-12">
            <div className="container mx-auto px-4">
                <Badge className="mb-4">Now Casting</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{activeEvent.title}</h1>
                <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <span>{format(activeEvent.startDate, 'MMM d')} - {format(activeEvent.endDate, 'MMM d, yyyy')}</span>
                    </div>
                    {activeEvent.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            <span>{activeEvent.location}</span>
                        </div>
                    )}
                </div>
                <p className="max-w-3xl text-lg opacity-80">{activeEvent.description}</p>
            </div>
        </div>

        <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold mb-8">Select a Time Slot</h2>
            
            <div className="space-y-12">
                {Object.entries(slotsByDate).sort().map(([date, daySlots]) => (
                    <div key={date}>
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b pb-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            {format(new Date(date), 'EEEE, MMMM do')}
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {daySlots.map(slot => {
                                const isFull = slot.signups.length >= slot.capacity
                                return (
                                    <Dialog key={slot.id}>
                                        <DialogTrigger asChild disabled={isFull}>
                                            <Button 
                                                variant={isFull ? "outline" : "default"} 
                                                className={`h-auto py-4 flex flex-col gap-1 ${isFull ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transition-transform'}`}
                                            >
                                                <span className="font-bold text-lg">{format(slot.startTime, 'h:mm a')}</span>
                                                <span className="text-xs font-normal opacity-80">
                                                    {isFull ? "FULL" : `${slot.capacity - slot.signups.length} spots left`}
                                                </span>
                                            </Button>
                                        </DialogTrigger>
                                        {!isFull && (
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Confirm Audition Slot</DialogTitle>
                                                    <DialogDescription>
                                                        You are signing up for <strong>{activeEvent.title}</strong> on <strong>{format(slot.startTime, 'MMM d')} at {format(slot.startTime, 'h:mm a')}</strong>.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form action={signupForAudition}>
                                                    <input type="hidden" name="slotId" value={slot.id} />
                                                    <div className="grid gap-4 py-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="name">Full Name</Label>
                                                            <Input id="name" name="name" required placeholder="Jane Doe" />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="email">Email Address</Label>
                                                            <Input id="email" name="email" type="email" required placeholder="jane@example.com" />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="phone">Phone Number</Label>
                                                            <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="notes">Notes (Optional)</Label>
                                                            <Textarea id="notes" name="notes" placeholder="Any special requirements or questions?" />
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" className="w-full">Confirm Signup</Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        )}
                                    </Dialog>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </PublicLayout>
  )
}
