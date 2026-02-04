"use client";

import { useState, useEffect } from "react";
import { getSponsors, deleteSponsor } from "@/app/actions/sponsors";
import { SponsorForm } from "@/components/admin/sponsor-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Trash2, Pencil, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Define a type for Sponsor based on what getSponsors returns
// Since we don't have the type exported, we can infer it or define a compatible one.
type Sponsor = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  websiteUrl: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  order: number;
};

export default function SponsorsAdminPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | undefined>(undefined);

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const data = await getSponsors();
      setSponsors(data);
    } catch (error) {
      toast.error("Failed to fetch sponsors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sponsor?")) return;
    try {
      const result = await deleteSponsor(id);
      if (result.success) {
        toast.success("Sponsor deleted");
        fetchSponsors();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete sponsor");
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setSelectedSponsor(sponsor);
    setView("edit");
  };

  const handleCreate = () => {
    setSelectedSponsor(undefined);
    setView("create");
  };

  const handleBack = () => {
    setView("list");
    setSelectedSponsor(undefined);
    fetchSponsors(); // Refresh list
  };

  if (loading && view === "list" && sponsors.length === 0) {
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
              {view === "create" ? "New Sponsor" : "Edit Sponsor"}
            </h1>
            <p className="text-muted-foreground">
              {view === "create" ? "Add a new sponsor or partner." : "Update sponsor details."}
            </p>
          </div>
        </div>
        
        <SponsorForm 
            initialData={selectedSponsor} 
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
          <h1 className="text-3xl font-bold tracking-tight">Sponsors</h1>
          <p className="text-muted-foreground">
            Manage community sponsors and partners.
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add New Sponsor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sponsors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsors.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No sponsors found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sponsors.map((sponsor) => (
                  <TableRow key={sponsor.id}>
                    <TableCell>{sponsor.order}</TableCell>
                    <TableCell>
                      {sponsor.imageUrl ? (
                        <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                          <Image
                            src={sponsor.imageUrl}
                            alt={sponsor.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          No Img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {sponsor.name}
                    </TableCell>
                    <TableCell>
                      {sponsor.websiteUrl ? (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate max-w-[200px] block"
                        >
                          {sponsor.websiteUrl}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                        <Badge variant={sponsor.isActive ? "default" : "secondary"}>
                            {sponsor.isActive ? "Active" : "Inactive"}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(sponsor)}
                            >
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(sponsor.id)}
                            >
                                <Trash2 className="w-4 h-4" />
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
