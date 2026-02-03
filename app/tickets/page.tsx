
import { getShows } from "@/app/actions/shows";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

export default async function TicketsPage() {
  const shows = await getShows();
  const upcomingShows = shows.filter(s => s.status === "UPCOMING" || s.status === "CURRENT");

  return (
    <PublicLayout>
      <div className="container py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">Get Tickets</h1>
        
        {upcomingShows.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No shows are currently available for purchase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingShows.map((show) => (
              <Card key={show.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted relative">
                  {show.imageUrl ? (
                    <Image 
                      src={show.imageUrl} 
                      alt={show.title} 
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{show.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-3">
                    {show.shortDescription || show.description}
                  </p>
                  {show.startDate && (
                    <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4" />
                      <span>
                        {new Date(show.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/tickets/${show.slug}`}>
                      Select Dates
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
