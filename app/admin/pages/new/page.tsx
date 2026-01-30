import { PageForm } from "@/components/admin/page-form";

export default function NewPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Page</h1>
        <p className="text-muted-foreground">
          Add a new custom page to your website.
        </p>
      </div>
      <PageForm />
    </div>
  );
}
