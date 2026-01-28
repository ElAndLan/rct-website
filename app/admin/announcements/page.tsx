import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getNewsPosts, deleteNewsPost } from "@/app/actions/news";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function AnnouncementsPage() {
  const { posts } = await getNewsPosts(true); // Include unpublished

  async function handleDelete(id: string) {
    "use server";
    await deleteNewsPost(id);
    revalidatePath("/admin/announcements");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground">
            Manage news and announcements.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/announcements/new">
            <Plus className="mr-2 h-4 w-4" /> New Announcement
          </Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  {format(new Date(post.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>
                  {post.published ? (
                    <Badge variant="default">Published</Badge>
                  ) : (
                    <Badge variant="secondary">Draft</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/announcements/${post.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={handleDelete.bind(null, post.id)}>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(!posts || posts.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No announcements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
