import { getShowPerformances } from "@/app/actions/tickets";
import { getShows } from "@/app/actions/shows";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";

export async function generateStaticParams() {
  return [];
}

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ShowTicketsPage({ params }: PageProps) {
  const { slug } = await params;
  const show = await getShowPerformances(slug);

  if (!show) return notFound();

  return (
    <PublicLayout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
            <div className="aspect-[2/3] bg-muted rounded-lg overflow-hidden relative">
              {show.imageUrl && (
                <Image
                  src={show.imageUrl}
                  alt={show.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4">{show.title}</h1>
              <div className="prose max-w-none text-muted-foreground mb-6">
                {show.shortDescription}
              </div>

              <div className="space-y-4">
                {show.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{show.location}</span>
                  </div>
                )}
                <div className="text-xl font-semibold">
                  Tickets: ${Number(show.ticketPrice).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">Select a Performance</h2>

          <div className="grid gap-4">
            {show.performances.length === 0 ? (
              <div className="p-8 border rounded-lg text-center text-muted-foreground">
                No performances scheduled yet.
              </div>
            ) : (
              show.performances.map((perf) => (
                <div
                  key={perf.id}
                  className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="text-center p-3 bg-muted rounded-md min-w-[80px]">
                      <div className="text-sm font-medium uppercase text-muted-foreground">
                        {new Date(perf.date).toLocaleString("default", {
                          month: "short",
                        })}
                      </div>
                      <div className="text-2xl font-bold">
                        {new Date(perf.date).getDate()}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(perf.date).toLocaleDateString([], {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="w-4 h-4" />
                        {new Date(perf.date).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                  <Button asChild size="lg">
                    <Link href={`/tickets/${slug}/${perf.id}`}>
                      Buy Tickets
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
