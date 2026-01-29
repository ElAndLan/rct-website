import { getVolunteerApplications } from "@/app/actions/volunteer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  DeleteVolunteerButton,
  UpdateStatusButton,
} from "@/components/admin/volunteer-actions";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function VolunteerAdminPage() {
  const applications = await getVolunteerApplications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Volunteer Applications</h1>
        <Badge variant="outline" className="text-lg px-4 py-1">
          Total: {applications.length}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No applications yet.
                  </TableCell>
                </TableRow>
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(app.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{app.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {app.email} {app.email && app.phoneNumber && "•"}{" "}
                        {app.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {app.roles.slice(0, 2).map((role) => (
                          <Badge
                            key={role}
                            variant="secondary"
                            className="text-xs"
                          >
                            {role}
                          </Badge>
                        ))}
                        {app.roles.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{app.roles.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          app.status === "CONTACTED"
                            ? "default"
                            : app.status === "ARCHIVED"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 pr-4">
                              <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">
                                      Name
                                    </h4>
                                    <p>{app.fullName}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">
                                      Date Applied
                                    </h4>
                                    <p>
                                      {format(new Date(app.createdAt), "PPpp")}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">
                                      Email
                                    </h4>
                                    <p>{app.email || "N/A"}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground">
                                      Phone
                                    </h4>
                                    <p>{app.phoneNumber || "N/A"}</p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                                    Interested Roles
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {app.roles.map((role) => (
                                      <Badge key={role} variant="secondary">
                                        {role}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">
                                    About
                                  </h4>
                                  <p className="whitespace-pre-wrap text-sm">
                                    {app.about || "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">
                                    Availability
                                  </h4>
                                  <p className="whitespace-pre-wrap text-sm">
                                    {app.availability || "N/A"}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground">
                                    Additional Comments
                                  </h4>
                                  <p className="whitespace-pre-wrap text-sm">
                                    {app.additionalComments || "N/A"}
                                  </p>
                                </div>
                              </div>
                            </ScrollArea>

                            <div className="border-t pt-4 flex justify-between items-center mt-4">
                              <DeleteVolunteerButton id={app.id} />

                              <div className="space-x-2">
                                {app.status !== "CONTACTED" && (
                                  <UpdateStatusButton
                                    id={app.id}
                                    status="CONTACTED"
                                    currentStatus={app.status}
                                  />
                                )}
                                {app.status !== "ARCHIVED" && (
                                  <UpdateStatusButton
                                    id={app.id}
                                    status="ARCHIVED"
                                    currentStatus={app.status}
                                  />
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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
