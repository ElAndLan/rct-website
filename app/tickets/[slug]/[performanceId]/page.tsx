import {
  getPerformanceDetails,
  getAllPerformances,
} from "@/app/actions/tickets";
import PublicLayout from "@/components/layout/PublicLayout";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";

const SeatSelector = dynamic(
  () =>
    import("@/components/tickets/seat-selector").then(
      (mod) => mod.SeatSelector,
    ),
  {
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        Loading seat map...
      </div>
    ),
    ssr: false,
  },
);

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ slug: string; performanceId: string }>;
}

export default async function SeatSelectionPage({ params }: PageProps) {
  const { performanceId } = await params;
  const details = await getPerformanceDetails(performanceId);

  if (!details) return notFound();

  const { performance, seats } = details;

  return (
    <PublicLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-2 text-center">Select Seats</h1>
        <p className="text-center text-muted-foreground mb-8">
          {performance.show.title} •{" "}
          {new Date(performance.date).toLocaleString()}
        </p>

        <SeatSelector
          performanceId={performance.id}
          showTitle={performance.show.title}
          performanceDate={performance.date}
          seats={seats}
          basePrice={Number(performance.show.ticketPrice)}
        />
      </div>
    </PublicLayout>
  );
}
