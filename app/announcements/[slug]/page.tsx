import PublicLayout from "@/components/layout/PublicLayout";
import { getNewsPostBySlug, getNewsPosts } from "@/app/actions/news";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export async function generateStaticParams() {
  return [];
}
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ZoomableImage } from "@/components/ui/zoomable-image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { post } = await getNewsPostBySlug(slug);

  if (!post) {
    return {
      title: "Announcement Not Found",
    };
  }

  return {
    title: `${post.title} | Reading Civic Theatre`,
    description: post.content.substring(0, 160),
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { post } = await getNewsPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Button variant="ghost" className="mb-8" asChild>
          <Link href="/announcements">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Announcements
          </Link>
        </Button>

        <article>
          <header className="mb-8">
            <div className="text-muted-foreground mb-4">
              {format(new Date(post.createdAt), "MMMM d, yyyy")}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {post.title}
            </h1>
          </header>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {post.imageUrl && (
              <div className="w-full md:w-1/2 shrink-0">
                <ZoomableImage
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full rounded-xl shadow-lg"
                />
              </div>
            )}

            <div className="w-full prose max-w-none lg:prose-xl leading-relaxed text-lg">
              <div className="whitespace-pre-wrap">{post.content}</div>
            </div>
          </div>
        </article>
      </div>
    </PublicLayout>
  );
}
