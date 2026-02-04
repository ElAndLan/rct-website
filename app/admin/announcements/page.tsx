"use client";

import { useState, useEffect } from "react";
import { getNewsPosts, deleteNewsPost } from "@/app/actions/news";
import { NewsForm } from "@/components/admin/news-form";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
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
import { toast } from "sonner";

export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedPost, setSelectedPost] = useState<any | undefined>(undefined);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const result = await getNewsPosts(true);
      if (result.success) {
        setPosts(result.posts || []);
      } else {
        toast.error(result.error || "Failed to fetch posts");
      }
    } catch (error) {
      toast.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const result = await deleteNewsPost(id);
      if (result.success) {
        toast.success("Announcement deleted");
        fetchPosts();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const handleEdit = (post: any) => {
    setSelectedPost(post);
    setView("edit");
  };

  const handleCreate = () => {
    setSelectedPost(undefined);
    setView("create");
  };

  const handleBack = () => {
    setView("list");
    setSelectedPost(undefined);
    fetchPosts();
  };

  if (loading && view === "list" && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {view === "create" ? "New Announcement" : "Edit Announcement"}
            </h1>
            <p className="text-muted-foreground">
              {view === "create" ? "Create a new announcement." : "Update announcement details."}
            </p>
          </div>
        </div>
        
        <NewsForm 
            initialData={selectedPost} 
            onSuccess={handleBack}
            onCancel={() => setView("list")}
        />
      </div>
    );
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
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Announcement
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
            {posts.map((post) => (
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
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(post)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
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
