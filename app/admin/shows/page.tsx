"use client";

import {
  getShows,
  createShow,
  deleteShow,
  getShowById,
  ShowWithDetails,
} from "@/app/actions/shows";
import { ShowEditor } from "@/components/admin/show-editor";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  FileText,
  Loader2,
  Pencil,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Show = Awaited<ReturnType<typeof getShows>>[number];

export default function ShowsManagerPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState<"list" | "edit">("list");
  const [selectedShow, setSelectedShow] = useState<ShowWithDetails | null>(
    null,
  );

  const fetchShows = async () => {
    // Don't set loading to true to avoid flicker on refresh
    const data = await getShows();
    setShows(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchShows();
  }, []);

  async function handleCreate(formData: FormData) {
    try {
      await createShow(formData);
    } catch (e) {
      // Ignore redirect error or log it
      console.log("Redirect or error:", e);
    }
    await fetchShows();
    setDialogOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this show?")) return;
    try {
      await deleteShow(id);
    } catch (e) {
      console.log("Error deleting:", e);
    }
    setShows(shows.filter((s) => s.id !== id));
  }

  async function handleEdit(id: string) {
    setLoading(true);
    const show = await getShowById(id);
    if (show) {
      setSelectedShow(show);
      setView("edit");
    }
    setLoading(false);
  }

  function handleBack() {
    setView("list");
    setSelectedShow(null);
    fetchShows();
  }

  if (loading && view === "list") {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === "edit" && selectedShow) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Show: {selectedShow.title}
            </h1>
            <p className="text-muted-foreground">
              Manage details, cast, and photos.
            </p>
          </div>
        </div>

        <ShowEditor show={selectedShow} />
      </div>
    );
  }

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

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <form action={handleCreate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="author" className="text-right">
                    Author
                  </Label>
                  <Input id="author" name="author" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Summary
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Dates</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input type="date" name="startDate" required />
                    <span className="self-center">to</span>
                    <Input type="date" name="endDate" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Show</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shows</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.map((show) => {
                const isUpcoming = show.endDate
                  ? new Date(show.endDate) >= new Date()
                  : true;
                return (
                  <TableRow key={show.id}>
                    <TableCell className="font-medium">{show.title}</TableCell>
                    <TableCell>
                      {show.startDate
                        ? format(new Date(show.startDate), "MMM d, yyyy")
                        : "TBD"}
                      {show.endDate &&
                        ` - ${format(new Date(show.endDate), "MMM d, yyyy")}`}
                    </TableCell>
                    <TableCell>
                      {isUpcoming ? (
                        <Badge variant="default">Current/Upcoming</Badge>
                      ) : (
                        <Badge variant="secondary">Past</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(show.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(show.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {shows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No shows found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
