import PublicLayout from "@/components/layout/PublicLayout";
import { ContactForm } from "@/components/contact/contact-form";
import { getSiteSettings } from "@/app/actions/settings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Reading Civic Theatre",
  description: "Get in touch with Reading Civic Theatre.",
};

// Simple Markdown Parser for basic formatting
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  // Split by newlines to handle paragraphs/lists
  const lines = content.split("\n");

  return (
    <div className="space-y-4 text-muted-foreground leading-relaxed">
      {lines.map((line, index) => {
        if (!line.trim()) return <br key={index} />;

        // List items
        if (line.trim().startsWith("- ")) {
            return (
                <ul key={index} className="list-disc pl-5">
                    <li>{parseInline(line.trim().substring(2))}</li>
                </ul>
            )
        }

        // Headers (simple)
        if (line.trim().startsWith("# ")) {
            return <h1 key={index} className="text-2xl font-bold text-foreground">{parseInline(line.trim().substring(2))}</h1>
        }
        if (line.trim().startsWith("## ")) {
            return <h2 key={index} className="text-xl font-bold text-foreground">{parseInline(line.trim().substring(3))}</h2>
        }

        return <p key={index}>{parseInline(line)}</p>;
      })}
    </div>
  );
}

// Helper to parse **bold** and *italic*
function parseInline(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Editable Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-6">
                {settings.contactPageTitle || "Contact Us"}
              </h1>
              <div className="prose prose-lg max-w-none">
                <MarkdownRenderer
                  content={
                    settings.contactPageBody ||
                    "We'd love to hear from you! Please fill out the form, and we'll get back to you as soon as possible."
                  }
                />
              </div>
            </div>

            {/* Additional Contact Info (Static/Settings based fallback) */}
            <div className="bg-muted/30 p-6 rounded-xl space-y-4 border">
              <h3 className="font-semibold text-lg">Other Ways to Reach Us</h3>
              
              <div className="space-y-1">
                <p className="font-medium">Mailing Address</p>
                <p className="text-muted-foreground text-sm">
                  {settings.contactAddress1 || "123 Theatre Lane"}
                  <br />
                  {settings.contactAddress2 || "Cityville, ST 12345"}
                </p>
              </div>

              {settings.contactEmail && (
                <div className="space-y-1 pt-2">
                  <p className="font-medium">Email</p>
                  <a 
                    href={`mailto:${settings.contactEmail}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
