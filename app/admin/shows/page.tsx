import { getShows, createShow, deleteShow } from "@/app/actions/shows";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, ExternalLink } from "lucide-react";

export default async function ShowsManagerPage() {
  const shows = await getShows();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shows & Programs
          </h1>
          <p className="text-muted-foreground">
            Manage productions and digital playbills.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Show
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Show</DialogTitle>
              <DialogDescription>
                Create a new production. You can add the Program PDF later.
              </DialogDescription>
            </DialogHeader>
            <form action={createShow}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. The SpongeBob Musical"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <select
                      name="status"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    >
                      <option value="UPCOMING">Upcoming</option>
                      <option value="CURRENT">Current (Now Playing)</option>
                      <option value="PAST">Past (Archive)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticketLink" className="text-right">
                    Ticket URL
                  </Label>
                  <Input
                    id="ticketLink"
                    name="ticketLink"
                    placeholder="https://..."
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="programPdfUrl" className="text-right">
                    Program PDF
                  </Label>
                  <Input
                    id="programPdfUrl"
                    name="programPdfUrl"
                    placeholder="URL to PDF file"
                    className="col-span-3"
                  />
                  <span className="text-xs text-muted-foreground col-start-2 col-span-3">
                    *Upload the PDF to a host and paste the link here.
                  </span>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Synopsis
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="col-span-3"
                    placeholder="Show synopsis..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Show</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shows.map((show) => (
          <Card key={show.id} className="overflow-hidden">
            <div className="h-48 bg-muted flex items-center justify-center text-muted-foreground">
              {show.imageUrl ? (
                <img
                  src={show.imageUrl}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold opacity-20">NO IMAGE</span>
              )}
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge
                  variant={show.status === "CURRENT" ? "default" : "secondary"}
                >
                  {show.status}
                </Badge>
                {show.programPdfUrl && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 text-blue-600 border-blue-200"
                  >
                    <FileText size={10} /> Program Active
                  </Badge>
                )}
              </div>
              <CardTitle className="mt-2 line-clamp-1">{show.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {show.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-2">
                <a href={`/admin/shows/${show.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    Edit Details
                  </Button>
                </a>
                <form action={deleteShow.bind(null, show.id)}>
                  <Button variant="destructive" size="icon">
                    <Trash2 size={16} />
                  </Button>
                </form>
              </div>
              {show.ticketLink && (
                <a
                  href={show.ticketLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground mt-4 hover:underline"
                >
                  <ExternalLink size={10} /> View Ticket Page
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
