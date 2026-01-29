import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AuditionManager } from "./client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: {
    showId: string;
  };
}

export default async function ManageAuditionPage({ params }: PageProps) {
  // Await params before using it (Next.js 15+ requirement, but good practice in 14 too)
  const { showId } = await params;

  if (!showId) {
    notFound();
  }

  const show = await prisma.show.findUnique({
    where: { id: showId },
    include: {
      audition: {
        include: {
          slots: {
            include: {
              attendees: true,
              _count: {
                select: { attendees: true },
              },
            },
            orderBy: {
              startTime: 'asc',
            },
          },
        },
      },
    },
  });

  if (!show) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/auditions"
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Manage Auditions: {show.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure schedule and capacity for this production.
          </p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {show.status}
        </Badge>
      </div>

      <AuditionManager
        showId={show.id}
        initialAudition={show.audition}
        slots={show.audition?.slots || []}
      />
    </div>
  );
}
