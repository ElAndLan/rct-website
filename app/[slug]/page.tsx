import PublicLayout from "@/components/layout/PublicLayout";
import { getPageBySlug } from "@/app/actions/pages";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MembershipForm } from "@/components/membership/membership-form";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPageBySlug(slug);
  
  if (!result.success || !result.page) {
    return {
      title: "Page Not Found",
    };
  }
  return {
    title: `${result.page.title} | Reading Civic Theatre`,
  };
}

export default async function CustomPage({ params }: Props) {
  const { slug } = await params;
  const result = await getPageBySlug(slug);

  if (!result.success || !result.page) {
    notFound();
  }

  const { page } = result;

  if (!page.isPublished) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 min-h-[60vh]">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight mb-4">{page.title}</h1>
            <div className="h-1 w-20 bg-primary rounded-full"></div>
          </header>
          
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
            <div 
              className="font-sans"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>

          {/* Special Injection for Membership Page */}
          {slug === "membership" && (
            <div className="mt-12 border-t pt-12">
                <MembershipForm />
            </div>
          )}
        </article>
      </div>
    </PublicLayout>
  );
}
