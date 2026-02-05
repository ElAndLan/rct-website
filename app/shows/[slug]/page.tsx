import PublicLayout from "@/components/layout/PublicLayout";
import { getShowBySlug, getShows } from "@/app/actions/shows";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export async function generateStaticParams() {
  return [];
}
import { Ticket, FileText, Calendar, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);
  if (!show) return { title: "Show Not Found" };
  return {
    title: `${show.title} | Reading Civic Theatre`,
    description: show.shortDescription || show.description?.slice(0, 160),
  };
}

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const show = await getShowBySlug(slug);

  if (!show) {
    notFound();
  }

  return (
    <PublicLayout>
      {/* Banner Section */}
      <div className="w-full h-[400px] md:h-[600px] relative bg-muted">
        {show.imageUrl ? (
          <Image
            src={show.imageUrl}
            alt={show.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xl">
            No Image Available
          </div>
        )}
        {/* Overlay for Title visibility? Optional, but often helpful if text was over image. 
            User said "text... below it", so I'll keep text below. 
        */}
      </div>

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/shows"
          className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Current Season
        </Link>

        {/* Main Details Section - Now centered/full-width below banner */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex flex-col items-center text-center">
            <Badge
              variant={show.status === "CURRENT" ? "default" : "secondary"}
              className="mb-4"
            >
              {show.status === "UPCOMING"
                ? "Upcoming"
                : show.status === "CURRENT"
                  ? "Now Playing"
                  : "Past Production"}
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {show.title}
            </h1>

            {(show.startDate || show.location) && (
              <div className="flex flex-wrap justify-center gap-6 text-muted-foreground mb-8 text-lg">
                {show.startDate && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>
                      {format(new Date(show.startDate), "MMMM d")}
                      {show.endDate &&
                        ` - ${format(new Date(show.endDate), "MMMM d, yyyy")}`}
                      {!show.endDate &&
                        format(new Date(show.startDate), ", yyyy")}
                    </span>
                  </div>
                )}
                {show.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{show.location}</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {show.ticketLink && (
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a
                    href={show.ticketLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Ticket className="w-5 h-5 mr-2" /> Buy Tickets
                  </a>
                </Button>
              )}
              {show.programPdfUrl && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                  asChild
                >
                  <a
                    href={show.programPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="w-5 h-5 mr-2" /> View Program
                  </a>
                </Button>
              )}
            </div>

            <div className="prose max-w-none text-lg text-muted-foreground text-left whitespace-pre-wrap w-full">
              {show.description}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {show.cast.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center">Cast</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {show.cast.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border rounded-lg p-4 flex flex-col items-center text-center hover:shadow-md transition-shadow"
                >
                  <div className="w-24 h-24 mb-3 rounded-full overflow-hidden bg-muted shadow-sm relative">
                    {member.imageUrl ? (
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                        <span className="text-xs">No Photo</span>
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-lg mb-1">{member.name}</div>
                  <div className="text-muted-foreground">{member.role}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {show.photos.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">Gallery</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {show.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <ZoomableImage
                    src={photo.url}
                    alt={photo.caption || "Show photo"}
                    className="w-full aspect-square object-cover"
                  />
                  {photo.caption && (
                    <div className="p-2 text-sm text-center text-muted-foreground bg-card">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
}
