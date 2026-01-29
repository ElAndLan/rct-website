import PublicLayout from "@/components/layout/PublicLayout";

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
