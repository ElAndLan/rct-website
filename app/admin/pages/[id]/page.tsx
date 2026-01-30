import { getPage } from "@/app/actions/pages";
import { PageForm } from "@/components/admin/page-form";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: { id: string } }) {
  const result = await getPage(params.id);
  
  if (!result.success || !result.page) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
        <p className="text-muted-foreground">
          Edit content and settings for this page.
        </p>
      </div>
      <PageForm initialData={result.page} />
    </div>
  );
}
