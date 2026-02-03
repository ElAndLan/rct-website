import PublicLayout from "@/components/layout/PublicLayout";
import { getPreviousShows } from "@/app/actions/shows";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = {
  title: "Previous Shows | Reading Civic Theatre",
  description: "Explore our past productions.",
};

export default async function PreviousShowsPage() {
  const shows = await getPreviousShows();

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Previous Shows</h1>

        {shows.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No previous shows found.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {shows.map((show) => (
              <Card
                key={show.id}
                className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full opacity-90 hover:opacity-100"
              >
                {show.imageUrl && (
                  <div className="h-60 w-full relative bg-muted/50 grayscale hover:grayscale-0 transition-all duration-300">
                    <Image
                      src={show.imageUrl}
                      alt={show.title}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl font-bold leading-tight flex items-start justify-between gap-2">
                    <Link
                      href={`/shows/${show.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {show.title}
                    </Link>
                    {show.endDate && (
                      <Badge variant="secondary" className="shrink-0 text-xs font-normal">
                        Ended {format(new Date(show.endDate), "MMM d, yyyy")}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1">
                  <p className="text-muted-foreground line-clamp-4">
                    {show.shortDescription || show.description}
                  </p>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/shows/${show.slug}`}>View Details</Link>
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
