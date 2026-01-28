"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Ticket, ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { Show } from "@prisma/client";

interface HeroCarouselProps {
  shows: Partial<Show>[];
}

export function HeroCarousel({ shows = [] }: HeroCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  // Combine real shows with static slides if needed, or just use shows
  // For now, let's create slides from shows + maybe one generic "Season" slide if empty

  const slides = shows.map((show) => ({
    id: show.id,
    title: show.title,
    description:
      show.shortDescription || show.description?.substring(0, 150) + "...",
    image: show.imageUrl,
    gradient: "bg-gradient-to-br from-zinc-800 to-black",
    slug: show.slug,
    ticketLink: show.ticketLink,
    type: "show",
  }));

  if (slides.length === 0) {
    // Fallback slides
    slides.push({
      id: "default-1",
      title: "2025 Season",
      description:
        "Experience the magic of live theatre. Join us for an unforgettable season.",
      image: null,
      gradient: "bg-gradient-to-br from-red-900 to-rose-950",
      slug: "",
      ticketLink: null,
      type: "generic",
    });
  }

  // Always add Auditions slide? Maybe not if not requested. The user said "area where Spongebob is... be a rotating carousel".
  // I'll stick to shows primarily.

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full relative group"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <section className="relative h-[600px] flex items-center justify-center bg-zinc-900 text-white overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 z-0 opacity-40">
                {slide.image ? (
                  <img
                    src={slide.image}
                    alt={slide.title || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full ${slide.gradient}`} />
                )}
              </div>

              {/* Content */}
              <div className="container mx-auto px-4 z-10 text-center relative">
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                    {slide.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {slide.ticketLink && (
                      <a
                        href={slide.ticketLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          size="lg"
                          className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        >
                          <Ticket className="mr-2" /> Buy Tickets
                        </Button>
                      </a>
                    )}

                    {slide.type === "show" && slide.slug && (
                      <Link href={`/shows/${slide.slug}`}>
                        <Button
                          size="lg"
                          variant="outline"
                          className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 border-white text-white backdrop-blur-sm"
                        >
                          Learn More
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="left-4 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm" />
      <CarouselNext className="right-4 bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-sm" />
    </Carousel>
  );
}
