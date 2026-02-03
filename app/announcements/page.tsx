import PublicLayout from "@/components/layout/PublicLayout";
import { getNewsPosts } from "@/app/actions/news";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Announcements | Reading Civic Theatre",
  description: "Latest news and updates from Reading Civic Theatre.",
};

export default async function AnnouncementsPage() {
  const { posts } = await getNewsPosts(false); // Only published

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Announcements</h1>

        <div className="grid gap-6">
          {posts?.map((post) => (
            <Card
              key={post.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="md:flex items-start gap-6 p-6">
                {post.imageUrl && (
                  <div className="md:w-1/3 shrink-0">
                    <div className="aspect-video relative rounded-md overflow-hidden bg-muted">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                      />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground mb-2">
                    {format(new Date(post.createdAt), "MMMM d, yyyy")}
                  </div>
                  <h2 className="text-2xl font-bold mb-4 leading-tight">
                    <Link
                      href={`/announcements/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.content}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold"
                    asChild
                  >
                    <Link href={`/announcements/${post.slug}`}>
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {(!posts || posts.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No announcements at this time.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
