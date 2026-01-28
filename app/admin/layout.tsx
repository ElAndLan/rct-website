
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Protect Admin Routes
  // Uncomment this when Authentication is fully tested
  // if (!session?.user || session.user.role !== "ADMIN") {
  //   redirect("/api/auth/signin")
  // }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex h-16 items-center border-b px-4">
            <SidebarTrigger />
            <div className="ml-4 font-semibold">Admin Panel</div>
        </div>
        <div className="p-6">
            {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
