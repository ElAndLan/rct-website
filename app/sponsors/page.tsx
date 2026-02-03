import PublicLayout from "@/components/layout/PublicLayout";
import { getActiveSponsors } from "@/app/actions/sponsors";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Sponsors | Reading Civic Theatre",
  description: "Support the businesses that support the arts.",
};

export default async function SponsorsPage() {
  const sponsors = await getActiveSponsors();

  return (
    <PublicLayout>
      {/* Hero/Intro */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Sponsors</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Our productions would not be possible without the generous support
            of our sponsors. Please consider supporting the businesses that
            support the arts in our community.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {sponsors.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">
              Become Our First Sponsor!
            </h3>
            <p className="text-muted-foreground mb-8">
              We are currently looking for community partners for our upcoming
              season.
            </p>
            <Button asChild size="lg">
              <Link href="/contact">Contact Us to Sponsor</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <Card
                key={sponsor.id}
                className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col"
              >
                <div className="p-8 flex items-center justify-center bg-white h-48 border-b">
                  {sponsor.imageUrl ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={sponsor.imageUrl}
                        alt={sponsor.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">
                      {sponsor.name}
                    </div>
                  )}
                </div>
                <CardContent className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold mb-2">{sponsor.name}</h3>
                  {sponsor.description && (
                    <p className="text-muted-foreground mb-6 flex-1 whitespace-pre-wrap">
                      {sponsor.description}
                    </p>
                  )}

                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    {sponsor.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-2 h-4 w-4 shrink-0" />
                        <a
                          href={`mailto:${sponsor.email}`}
                          className="hover:underline truncate"
                        >
                          {sponsor.email}
                        </a>
                      </div>
                    )}
                    {sponsor.phone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-2 h-4 w-4 shrink-0" />
                        <a
                          href={`tel:${sponsor.phone.replace(/\D/g, "")}`}
                          className="hover:underline"
                        >
                          {sponsor.phone}
                        </a>
                      </div>
                    )}
                    {sponsor.websiteUrl && (
                      <Button variant="outline" className="w-full mt-2" asChild>
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> Visit
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 text-center bg-primary/5 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Interested in Sponsoring?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Reach a passionate local audience while supporting community
            theatre. We offer various sponsorship tiers and benefits.
          </p>
          <Button size="lg" asChild>
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" /> Get in Touch
            </Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
