import { NewsForm } from "../news-form";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.newsPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Announcement</h1>
        <p className="text-muted-foreground">
          Update existing announcement.
        </p>
      </div>
      <NewsForm initialData={post} />
    </div>
  );
}
