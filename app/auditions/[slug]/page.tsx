import { notFound } from "next/navigation";
import { PublicAuditionClient } from "./client";
import { Metadata } from "next";
import { getAuditionBySlug } from "@/app/actions/audition";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const show = await getAuditionBySlug(slug);

  if (!show) return { title: "Auditions Not Found" };

  return {
    title: `Auditions for ${show.title} | Reading Civic Theatre`,
    description: `Sign up for auditions for ${show.title}.`,
  };
}

export default async function PublicAuditionPage({ params }: Props) {
  const { slug } = await params;

  const show = await getAuditionBySlug(slug);

  if (!show || !show.audition || !show.audition.isActive) {
    notFound();
  }

  // Transform slots to include attendee count flatly
  const slots = show.audition.slots.map((slot) => ({
    id: slot.id,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: slot.capacity,
    attendeeCount: slot._count.attendees,
  }));

  return (
    <PublicAuditionClient
      showTitle={show.title}
      description={show.audition.description}
      location={show.audition.location}
      slots={slots}
    />
  );
}
