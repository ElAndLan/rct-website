import Link from "next/link";
import { getMenuItems } from "@/app/actions/menu";
import { getSiteSettings } from "@/app/actions/settings";
import { cn } from "@/lib/utils";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function Navbar() {
  const menuItems = await getMenuItems();
  const settings = await getSiteSettings();

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 container mx-auto px-4 min-h-20 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {settings.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={settings.logoUrl}
              alt="Reading Civic Theatre"
              className="h-16 w-auto object-contain"
            />
          ) : (
            <div className="bg-primary text-primary-foreground font-bold text-2xl px-3 py-1 rounded-sm">
              RCT
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 justify-end ml-4">
          <ul className="flex flex-wrap justify-end gap-1">
            {menuItems.map((item) => (
              <li key={item.id} className="flex items-center">
                {item.children.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
                      >
                        {item.label}
                        <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.id} asChild>
                          <Link
                            href={child.path || "#"}
                            className="w-full cursor-pointer"
                          >
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    asChild
                    variant="ghost"
                    className="h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
                  >
                    <Link href={item.path || "#"}>{item.label}</Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    {item.children.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <div className="font-medium px-2 text-lg">
                          {item.label}
                        </div>
                        <div className="pl-4 flex flex-col gap-2 border-l ml-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.path || "#"}
                              className="text-muted-foreground hover:text-foreground py-1 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.path || "#"}
                        className="font-medium text-lg px-2 py-1 hover:bg-accent rounded-md transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Header Banner Image */}
      {settings.headerBannerUrl && (
        <div className="w-full border-t bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={settings.headerBannerUrl}
            alt="Header Banner"
            className="w-full h-[100px] object-fill"
          />
        </div>
      )}
    </header>
  );
}
