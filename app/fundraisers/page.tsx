import PublicLayout from "@/components/layout/PublicLayout";
import { getFundraisers } from "@/app/actions/fundraisers";
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
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";

export const metadata = {
  title: "Fundraisers | Reading Civic Theatre",
  description: "Support RCT through our fundraising events.",
};

export default async function FundraisersPage() {
  const fundraisers = await getFundraisers();
  const activeFundraisers = fundraisers.filter((f) => f.isActive);

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Fundraisers</h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {activeFundraisers.map((fundraiser) => (
            <Card
              key={fundraiser.id}
              className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow h-full"
            >
              {fundraiser.imageUrl && (
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={fundraiser.imageUrl}
                    alt={fundraiser.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl font-bold leading-tight">
                  <Link
                    href={`/fundraisers/${fundraiser.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {fundraiser.title}
                  </Link>
                </CardTitle>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-2">
                  {fundraiser.events.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(fundraiser.events[0].startTime, "MMM d, yyyy")}
                        {fundraiser.events.length > 1 &&
                          ` + ${fundraiser.events.length - 1} more`}
                      </span>
                    </div>
                  )}
                  {(fundraiser.locationName || fundraiser.city) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {fundraiser.locationName}
                        {fundraiser.locationName && fundraiser.city ? ", " : ""}
                        {fundraiser.city}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <p className="text-muted-foreground line-clamp-4">
                  {fundraiser.shortDescription}
                </p>
              </CardContent>

              <CardFooter className="pt-0">
                <Button className="w-full" asChild>
                  <Link href={`/fundraisers/${fundraiser.slug}`}>
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}

          {activeFundraisers.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <p>
                No active fundraisers at the moment. Please check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
