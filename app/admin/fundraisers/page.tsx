"use client";

import { useState, useEffect } from "react";
import { getFundraisers, deleteFundraiser, FundraiserWithEvents } from "@/app/actions/fundraisers";
import { FundraiserForm } from "@/components/admin/fundraiser-form";
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
import { Plus, Trash2, Pencil, Calendar, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function FundraisersAdminPage() {
  // Use 'any' to avoid TS Date vs String serialization issues for now, 
  // or just rely on the fact that new Date() handles both.
  const [fundraisers, setFundraisers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedFundraiser, setSelectedFundraiser] = useState<any | undefined>(undefined);

  const fetchFundraisers = async () => {
    setLoading(true);
    try {
      const data = await getFundraisers();
      setFundraisers(data);
    } catch (error) {
      toast.error("Failed to fetch fundraisers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFundraisers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fundraiser?")) return;
    try {
      const result = await deleteFundraiser(id);
      if (result.success) {
        toast.success("Fundraiser deleted");
        fetchFundraisers();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete fundraiser");
    }
  };

  const handleEdit = (fundraiser: any) => {
    setSelectedFundraiser(fundraiser);
    setView("edit");
  };

  const handleCreate = () => {
    setSelectedFundraiser(undefined);
    setView("create");
  };

  const handleBack = () => {
    setView("list");
    setSelectedFundraiser(undefined);
    fetchFundraisers();
  };

  if (loading && view === "list" && fundraisers.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === "create" ? "New Fundraiser" : "Edit Fundraiser"}
            </h1>
            <p className="text-muted-foreground">
              {view === "create" ? "Create a new fundraising event." : "Update fundraiser details."}
            </p>
          </div>
        </div>
        
        <FundraiserForm 
            initialData={selectedFundraiser} 
            onSuccess={handleBack}
            onCancel={() => setView("list")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fundraisers</h1>
          <p className="text-muted-foreground">
            Manage fundraising events and campaigns.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add New Fundraiser
        </Button>
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
                                {fundraiser.events.slice(0, 2).map((e: any) => (
                                    <span key={e.id} className="text-xs text-muted-foreground">
                                        {format(new Date(e.startTime), "MMM d, yyyy h:mm a")}
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
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(fundraiser)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(fundraiser.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
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
