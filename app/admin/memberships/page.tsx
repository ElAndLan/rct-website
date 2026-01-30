import { getMembershipApplications } from "@/app/actions/membership";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { Pencil } from "lucide-react";

export default async function MembershipsAdminPage() {
  const result = await getMembershipApplications();
  const applications = result.applications || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Membership Applications</h1>
          <p className="text-muted-foreground">
            View submitted membership forms.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier / Amount</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No applications received yet.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      {format(app.createdAt, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.firstName} {app.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.type}</Badge>
                      {app.type === "Student" && (
                          <div className="text-xs text-muted-foreground mt-1">
                              {app.school} (Gr. {app.grade})
                          </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{app.tier}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.amount && Number(app.amount) > 0 ? `$${app.amount}` : "Free"}
                      </div>
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell className="text-xs">
                        {app.hideAddress && <span className="block text-red-500">No Address</span>}
                        {app.hidePhone && <span className="block text-red-500">No Phone</span>}
                        {app.hideEmail && <span className="block text-red-500">No Email</span>}
                        {!app.hideAddress && !app.hidePhone && !app.hideEmail && (
                            <span className="text-green-600">Full Listing</span>
                        )}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/memberships/${app.id}`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Link>
                        </Button>
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
