"use client";

import { getPages, deletePageAction } from "@/app/actions/pages";
import { PageForm } from "@/components/admin/page-form";
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
import {
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// Define the type based on Prisma result
type Page = {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export default function PagesAdminPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  const fetchPages = async () => {
    // We don't set loading to true here to avoid flickering on re-fetch
    const result = await getPages();
    if (result.success && result.pages) {
      setPages(result.pages);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Handler to go back to list
  const handleBack = () => {
    setView("list");
    setSelectedPage(null);
    fetchPages(); // Refresh data
  };

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setView("edit");
  };

  const handleCreate = () => {
    setSelectedPage(null);
    setView("create");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      await deletePageAction(id);
      setPages(pages.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === "create" || (view === "edit" && selectedPage)) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === "create"
                ? "Create New Page"
                : `Edit Page: ${selectedPage?.title}`}
            </h1>
            <p className="text-muted-foreground">
              {view === "create"
                ? "Add a new custom page to your website."
                : "Edit content and settings for this page."}
            </p>
          </div>
        </div>
        {/* We key the form to force re-mount when switching pages */}
        <PageForm key={selectedPage?.id || "new"} initialData={selectedPage} />
        {/* Note: PageForm calls server actions that redirect to /admin/pages.
            Since we are ON /admin/pages, the redirect might reload the page,
            resetting state to 'list', which is what we want.
        */}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Pages</h1>
          <p className="text-muted-foreground">
            Manage custom pages for your website (e.g., /about, /history).
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Create New Page
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug (URL)</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No pages found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {format(new Date(page.updatedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {page.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {page.isPublished && (
                          <Link href={`/${page.slug}`} target="_blank">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Live"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => handleEdit(page)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(page.id)}
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
