import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Ticket, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getHeroSlides } from "@/app/actions/hero-slides";
import { getSiteSettings } from "@/app/actions/settings";

export default async function Home() {
  const { slides } = await getHeroSlides();
  const settings = await getSiteSettings();
  const activeSlides = slides?.filter((s) => s.isActive) || [];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroCarousel slides={activeSlides} />

      {/* Customizable Welcome Section */}
      {(settings.homeSectionImageUrl || settings.homeSectionTitle) && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Image */}
              <div className="relative">
                {settings.homeSectionImageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={settings.homeSectionImageUrl}
                    alt={settings.homeSectionTitle || "Season Image"}
                    className="w-full rounded-lg shadow-lg object-cover"
                  />
                )}
              </div>

              {/* Right: Content */}
              <div>
                {settings.homeSectionTitle && (
                  <h2 className="text-3xl font-bold mb-6">
                    {settings.homeSectionTitle}
                  </h2>
                )}
                {settings.homeSectionBody && (
                  <div className="prose max-w-none text-muted-foreground whitespace-pre-wrap text-lg leading-relaxed">
                    {settings.homeSectionBody}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card hover:shadow-lg transition-shadow border-none shadow-md">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-6">
                  <Ticket className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">See a Show</h3>
                <p className="text-muted-foreground mb-6">
                  Experience the magic of live theatre. Check out our current
                  season.
                </p>
                <Button
                  variant="link"
                  className="text-primary font-semibold"
                  asChild
                >
                  <Link href="/shows">
                    View Season <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card hover:shadow-lg transition-shadow border-none shadow-md">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-6">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Audition</h3>
                <p className="text-muted-foreground mb-6">
                  Join us on stage! We welcome performers of all experience
                  levels.
                </p>
                <Button
                  variant="link"
                  className="text-primary font-semibold"
                  asChild
                >
                  <Link href="/auditions">
                    View Openings <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-card hover:shadow-lg transition-shadow border-none shadow-md">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <div className="bg-primary/10 p-4 rounded-full mb-6">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Get Involved</h3>
                <p className="text-muted-foreground mb-6">
                  Volunteer backstage, build sets, or help with costumes.
                </p>
                <Button variant="link" className="text-primary font-semibold">
                  Volunteer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest News</h2>
              <p className="text-muted-foreground">
                Updates from the theatre board and community.
              </p>
            </div>
            <Button variant="outline">View All News</Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-video bg-muted rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-full bg-zinc-200 group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="text-sm text-primary font-medium mb-2">
                  October 15, 2024
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  Cast Announced for The SpongeBob Musical
                </h3>
                <p className="text-muted-foreground line-clamp-2">
                  We are thrilled to announce the talented cast that will be
                  bringing Bikini Bottom to life...
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Strip */}
      <section className="py-12 bg-zinc-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h4 className="text-sm uppercase tracking-widest opacity-60 mb-8">
            Supported By
          </h4>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholders for logos */}
            <div className="text-2xl font-bold">Local Bank</div>
            <div className="text-2xl font-bold">City Council</div>
            <div className="text-2xl font-bold">Arts Foundation</div>
            <div className="text-2xl font-bold">Radio 99.9</div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
