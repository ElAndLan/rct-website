import {
  LayoutDashboard,
  CalendarDays,
  Users,
  FileText,
  Settings,
  Menu,
  Megaphone,
  Ticket,
  Shield,
  Image as ImageIcon,
  HeartHandshake,
  CreditCard,
  Mail,
  ChevronDown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Menu groups
const groups = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Show Management",
    items: [
      {
        title: "Shows & Programs",
        url: "/admin/shows",
        icon: Ticket,
      },
      {
        title: "Ticket Orders",
        url: "/admin/orders",
        icon: CreditCard,
      },
      {
        title: "Auditions",
        url: "/admin/auditions",
        icon: Users,
      },
      {
        title: "Volunteers",
        url: "/admin/volunteers",
        icon: HeartHandshake,
      },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        title: "Pages",
        url: "/admin/pages",
        icon: FileText,
      },
      {
        title: "Menu Manager",
        url: "/admin/menu",
        icon: Menu,
      },
      {
        title: "Hero Carousel",
        url: "/admin/hero",
        icon: ImageIcon,
      },
      {
        title: "Home Content",
        url: "/admin/home-content",
        icon: LayoutDashboard,
      },
      {
        title: "Announcements",
        url: "/admin/announcements",
        icon: Megaphone,
      },
      {
        title: "Contact Info",
        url: "/admin/contact-info",
        icon: Mail,
      },
      {
        title: "Sponsors",
        url: "/admin/sponsors",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Fundraising & Members",
    items: [
      {
        title: "Donation Page",
        url: "/admin/donations",
        icon: HeartHandshake,
      },
      {
        title: "Fundraisers",
        url: "/admin/fundraisers",
        icon: HeartHandshake,
      },
      {
        title: "Memberships",
        url: "/admin/memberships",
        icon: Users,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 font-bold text-sidebar-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            RCT
          </div>
          <span className="truncate">Reading Civic Theatre</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <Collapsible
            key={group.label}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {group.label}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="@admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <span className="font-semibold">Admin User</span>
            <span className="text-xs text-muted-foreground">admin@rct.com</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
