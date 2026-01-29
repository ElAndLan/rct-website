import prisma from "@/lib/prisma";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function PublicAuditionsPage() {
  // Fetch all shows that have active auditions
  const showsWithAuditions = await prisma.show.findMany({
    where: {
      audition: {
        isActive: true,
      },
    },
    include: {
      audition: {
        include: {
          slots: true,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return (
    <PublicLayout>
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Auditions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the Reading Civic Theatre family! Check out our upcoming
            auditions below.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {showsWithAuditions.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <h3 className="text-2xl font-semibold mb-2">
              No Auditions Currently Scheduled
            </h3>
            <p className="text-muted-foreground">
              Please check back later or follow us on social media for
              announcements.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {showsWithAuditions.map((show) => {
              const audition = show.audition!;
              const slotCount = audition.slots.length;

              return (
                <Card
                  key={show.id}
                  className="flex flex-col h-full hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
                    {show.imageUrl ? (
                      <img
                        src={show.imageUrl}
                        alt={show.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-primary/10 text-primary/40">
                        <Calendar className="w-16 h-16" />
                      </div>
                    )}
                    <Badge className="absolute top-4 right-4">Active</Badge>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-2xl">{show.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4" />
                      {audition.location || "Location TBD"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <p className="text-muted-foreground line-clamp-3 mb-6">
                      {audition.description ||
                        show.shortDescription ||
                        "No description available."}
                    </p>

                    <div className="mt-auto">
                      <Button asChild className="w-full group">
                        <Link href={`/auditions/${show.slug}`}>
                          View Times & Sign Up
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-3">
                        {slotCount} time slots available
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
