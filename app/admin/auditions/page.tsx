"use client";

import { 
    getAdminAuditionShows, 
    getAdminAuditionDetails, 
    AdminAuditionShow, 
    AdminAuditionDetails 
} from "@/app/actions/audition";
import { AuditionManager } from "@/components/admin/audition-manager";
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
import { Calendar, Eye, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function AuditionsIndexPage() {
  const [shows, setShows] = useState<AdminAuditionShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "manage">("list");
  const [selectedShowDetails, setSelectedShowDetails] = useState<AdminAuditionDetails | null>(null);

  const fetchShows = async () => {
    const data = await getAdminAuditionShows();
    setShows(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const handleManage = async (showId: string) => {
      setLoading(true);
      const details = await getAdminAuditionDetails(showId);
      if (details) {
          setSelectedShowDetails(details);
          setView("manage");
      }
      setLoading(false);
  }

  const handleBack = () => {
      setView("list");
      setSelectedShowDetails(null);
      fetchShows(); // Refresh list to update counts/statuses
  }

  if (loading && view === "list") {
      return (
          <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      );
  }

  if (view === "manage" && selectedShowDetails) {
      return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Manage Auditions: {selectedShowDetails.title}
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Configure schedule and capacity for this production.
                    </p>
                </div>
                <Badge variant="outline" className="ml-auto">
                    {selectedShowDetails.status}
                </Badge>
            </div>

            <AuditionManager
                showId={selectedShowDetails.id}
                initialAudition={selectedShowDetails.audition}
                slots={selectedShowDetails.audition?.slots || []}
            />
        </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auditions Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shows & Productions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Show Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audition Status</TableHead>
                <TableHead>Slots</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No shows found. Create a show first.
                  </TableCell>
                </TableRow>
              ) : (
                shows.map((show) => {
                  const hasAudition = !!show.audition;
                  const isActive = show.audition?.isActive;

                  return (
                    <TableRow key={show.id}>
                      <TableCell className="font-medium">
                        {show.title}
                        <div className="text-xs text-muted-foreground">
                          /{show.slug}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{show.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {hasAudition ? (
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{show.audition?._count.slots || 0}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleManage(show.id)}
                        >
                            <Calendar className="w-4 h-4 mr-2" />
                            {hasAudition ? "Manage" : "Setup"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
