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
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HeroSlide } from "@prisma/client";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides = [] }: HeroCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const hasSlides = slides.length > 0;

  // Fallback slide if no slides exist
  const displaySlides = hasSlides
    ? slides
    : [
        {
          id: "default-1",
          title: "Reading Civic Theatre",
          subtitle: "Experience the magic of live theatre.",
          imageUrl: "",
          linkText: "View Season",
          linkUrl: "/shows",
          secondaryLinkText: null,
          secondaryLinkUrl: null,
          isActive: true,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full relative group"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {displaySlides.map((slide, index) => (
          <CarouselItem key={slide.id}>
            <section className="relative h-[600px] flex items-center justify-center bg-zinc-900 text-white overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 z-0 opacity-40">
                {slide.imageUrl ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-900 to-zinc-950" />
                )}
              </div>

              {/* Content */}
              <div className="container mx-auto px-4 z-10 text-center relative">
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-700">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl">
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                      {slide.subtitle}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    {slide.linkText && slide.linkUrl && (
                      <Button
                        size="lg"
                        className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-white border-none shadow-lg"
                        asChild
                      >
                        <Link href={slide.linkUrl}>
                          {slide.linkText}{" "}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                    {slide.secondaryLinkText && slide.secondaryLinkUrl && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="text-lg px-8 py-6 bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 backdrop-blur-sm shadow-lg"
                        asChild
                      >
                        <Link href={slide.secondaryLinkUrl}>
                          {slide.secondaryLinkText}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Navigation Controls */}
      <div className="hidden group-hover:block transition-opacity duration-300">
        <CarouselPrevious className="left-4 bg-black/20 hover:bg-black/40 text-white border-white/20" />
        <CarouselNext className="right-4 bg-black/20 hover:bg-black/40 text-white border-white/20" />
      </div>
    </Carousel>
  );
}
