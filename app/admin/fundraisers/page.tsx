import { getFundraisers, deleteFundraiser } from "@/app/actions/fundraisers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function FundraisersAdminPage() {
  const fundraisers = await getFundraisers();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fundraisers</h1>
          <p className="text-muted-foreground">
            Manage fundraising events and campaigns.
          </p>
        </div>

        <Link href="/admin/fundraisers/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Fundraiser
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Fundraisers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fundraisers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No fundraisers found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                fundraisers.map((fundraiser) => (
                  <TableRow key={fundraiser.id}>
                    <TableCell className="font-medium">
                      {fundraiser.title}
                    </TableCell>
                    <TableCell>
                      {fundraiser.locationName || "N/A"}
                      {fundraiser.city && `, ${fundraiser.city}`}
                    </TableCell>
                    <TableCell>
                        {fundraiser.events.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {fundraiser.events.slice(0, 2).map(e => (
                                    <span key={e.id} className="text-xs text-muted-foreground">
                                        {format(e.startTime, "MMM d, yyyy h:mm a")}
                                    </span>
                                ))}
                                {fundraiser.events.length > 2 && (
                                    <span className="text-xs text-muted-foreground">
                                        +{fundraiser.events.length - 2} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-muted-foreground text-xs">No dates</span>
                        )}
                    </TableCell>
                    <TableCell>
                      {fundraiser.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/fundraisers/${fundraiser.id}`}>
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deleteFundraiser.bind(null, fundraiser.id)}>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
