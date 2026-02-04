"use client";

import { getMembershipApplications } from "@/app/actions/membership";
import { AdminMembershipForm } from "@/components/admin/membership-edit-form";
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
import { format } from "date-fns";
import { Pencil, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type Applications = Awaited<
  ReturnType<typeof getMembershipApplications>
>["applications"];

export default function MembershipsAdminPage() {
  const [applications, setApplications] = useState<Applications>(undefined);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "edit">("list");
  const [selectedApp, setSelectedApp] = useState<any>(undefined);

  const fetchApps = async () => {
    setLoading(true);
    const result = await getMembershipApplications();
    if (result.success && result.applications) {
      setApplications(result.applications);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleEdit = (app: any) => {
    setSelectedApp(app);
    setView("edit");
  };

  const handleBack = () => {
    setSelectedApp(undefined);
    setView("list");
    fetchApps();
  };

  if (loading && view === "list") {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === "edit" && selectedApp) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Membership
            </h1>
            <p className="text-muted-foreground">
              Manage membership details for {selectedApp.firstName}{" "}
              {selectedApp.lastName}.
            </p>
          </div>
        </div>
        <AdminMembershipForm
          application={selectedApp}
          onSuccess={handleBack}
          onCancel={() => setView("list")}
        />
      </div>
    );
  }

  const apps = applications || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Membership Applications
          </h1>
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
              {apps.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No applications received yet.
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      {format(new Date(app.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {app.firstName} {app.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.type}</Badge>
                      {app.type === "Student" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {app.grade ? `${app.grade} Grade` : ""}
                          {app.school ? ` at ${app.school}` : ""}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{app.tier}</div>
                      <div className="text-xs text-muted-foreground">
                        ${app.amount}
                      </div>
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {app.hideAddress && (
                          <Badge
                            variant="secondary"
                            className="w-fit text-[10px]"
                          >
                            Hide Addr
                          </Badge>
                        )}
                        {app.hidePhone && (
                          <Badge
                            variant="secondary"
                            className="w-fit text-[10px]"
                          >
                            Hide Phone
                          </Badge>
                        )}
                        {app.hideEmail && (
                          <Badge
                            variant="secondary"
                            className="w-fit text-[10px]"
                          >
                            Hide Email
                          </Badge>
                        )}
                        {!app.hideAddress &&
                          !app.hidePhone &&
                          !app.hideEmail && (
                            <span className="text-xs text-muted-foreground">
                              -
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(app)}
                      >
                        <Pencil className="h-4 w-4" />
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
