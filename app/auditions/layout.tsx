import PublicLayout from "@/components/layout/PublicLayout";

export default function AuditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
