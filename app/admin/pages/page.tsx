import { getPages, deletePage } from "@/app/actions/pages";
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
import { Plus, Trash2, Pencil, ExternalLink } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function PagesAdminPage() {
  const result = await getPages();
  const pages = result.pages || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Pages</h1>
          <p className="text-muted-foreground">
            Manage custom pages for your website (e.g., /about, /history).
          </p>
        </div>

        <Link href="/admin/pages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create New Page
          </Button>
        </Link>
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
                    <TableCell className="font-medium">
                      {page.title}
                    </TableCell>
                    <TableCell>
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {format(page.updatedAt, "MMM d, yyyy")}
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
                              <Button variant="ghost" size="icon" title="View Live">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                         )}
                        <Link href={`/admin/pages/${page.id}`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <form action={deletePage.bind(null, page.id)}>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete">
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
