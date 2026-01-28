import PublicLayout from "@/components/layout/PublicLayout";
import { getShows } from "@/app/actions/shows";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Ticket, Users, HandHeart } from "lucide-react";

export const metadata = {
  title: "Current Season | Reading Civic Theatre",
  description: "Check out our current and upcoming productions.",
};

export default async function ShowsPage() {
  const shows = await getShows();
  // Filter for Current and Upcoming shows only? 
  // User said "Current Season", usually implies active shows. 
  // For now I'll show all but sorted by date, or I could filter in the UI.
  // The action `getShows` returns all. 
  // Let's filter client-side or assume the user manages status.
  // Actually, usually "Current Season" might include recently past shows too.
  // I will just display them all for now as the user requested "add all the current shows".

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Current Season</h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {shows?.map((show) => (
            <Card key={show.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full">
              {show.imageUrl && (
                <div className="aspect-[3/4] relative bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={show.imageUrl}
                    alt={show.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl font-bold leading-tight">
                  <Link href={`/shows/${show.slug}`} className="hover:text-primary transition-colors">
                    {show.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-4">
                  {show.shortDescription || show.description}
                </p>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-0">
                <div className="flex flex-wrap gap-2 w-full">
                    {show.auditionLink && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={show.auditionLink} target="_blank" rel="noopener noreferrer">
                                <Users className="w-4 h-4 mr-2" /> Audition
                            </a>
                        </Button>
                    )}
                    {show.volunteerLink && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                            <a href={show.volunteerLink} target="_blank" rel="noopener noreferrer">
                                <HandHeart className="w-4 h-4 mr-2" /> Volunteer
                            </a>
                        </Button>
                    )}
                </div>
                
                <div className="flex gap-2 w-full">
                     {show.ticketLink && (
                        <Button className="flex-1" asChild>
                            <a href={show.ticketLink} target="_blank" rel="noopener noreferrer">
                                <Ticket className="w-4 h-4 mr-2" /> Buy Tickets
                            </a>
                        </Button>
                    )}
                    <Button variant="secondary" className="flex-1" asChild>
                        <Link href={`/shows/${show.slug}`}>
                            Learn More <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
              </CardFooter>
            </Card>
          ))}

          {(!shows || shows.length === 0) && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>No shows announced yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
