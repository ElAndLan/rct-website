
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { AdminGuard } from "@/components/admin/admin-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
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
    </AdminGuard>
  )
}
