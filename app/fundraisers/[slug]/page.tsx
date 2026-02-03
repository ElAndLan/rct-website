import PublicLayout from "@/components/layout/PublicLayout";
import { getFundraiserBySlug } from "@/app/actions/fundraisers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function FundraiserDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const fundraiser = await getFundraiserBySlug(slug);

  if (!fundraiser || !fundraiser.isActive) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/fundraisers">
          <Button
            variant="ghost"
            className="mb-6 pl-0 hover:pl-2 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Fundraisers
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-8">
            {fundraiser.imageUrl && (
              <div className="rounded-xl overflow-hidden border shadow-sm">
                <Image
                  src={fundraiser.imageUrl}
                  alt={fundraiser.title}
                  width={0}
                  height={0}
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="w-full h-auto"
                  priority
                />
              </div>
            )}

            <div>
              <h1 className="text-4xl font-bold mb-4">{fundraiser.title}</h1>
              <div className="prose prose-lg max-w-none whitespace-pre-wrap text-muted-foreground">
                {fundraiser.description}
              </div>
            </div>
          </div>

          {/* Right Column: Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Event Details</h3>

              <div className="space-y-6">
                {/* Dates & Times */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <Calendar className="h-5 w-5" />
                    <span>When</span>
                  </div>
                  <div className="space-y-3 pl-7">
                    {fundraiser.events.length > 0 ? (
                      fundraiser.events.map((event) => (
                        <div
                          key={event.id}
                          className="border-l-2 border-primary/20 pl-3"
                        >
                          <div className="font-medium">
                            {format(event.startTime, "EEEE, MMMM d, yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(event.startTime, "h:mm a")}
                            {event.endTime &&
                              ` - ${format(event.endTime, "h:mm a")}`}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        Date to be announced
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {(fundraiser.locationName || fundraiser.address) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <MapPin className="h-5 w-5" />
                      <span>Where</span>
                    </div>
                    <div className="pl-7 text-sm">
                      {fundraiser.locationName && (
                        <div className="font-semibold">
                          {fundraiser.locationName}
                        </div>
                      )}
                      {fundraiser.address && <div>{fundraiser.address}</div>}
                      {(fundraiser.city ||
                        fundraiser.state ||
                        fundraiser.zip) && (
                        <div>
                          {[fundraiser.city, fundraiser.state, fundraiser.zip]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
