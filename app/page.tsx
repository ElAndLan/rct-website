import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Ticket, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getHeroSlides } from "@/app/actions/hero-slides";
import { getSiteSettings } from "@/app/actions/settings";
import dynamic from "next/dynamic";

const HeroCarousel = dynamic(
  () => import("@/components/home/HeroCarousel").then((mod) => mod.HeroCarousel)
);

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
                  <Image
                    src={settings.homeSectionImageUrl}
                    alt={settings.homeSectionTitle || "Season Image"}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                    priority
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
