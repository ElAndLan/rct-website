import Link from "next/link";
import Image from "next/image";
import { getMenuItems } from "@/app/actions/menu";
import { getSiteSettings } from "@/app/actions/settings";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { NavbarMenu } from "@/components/layout/NavbarMenu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export async function Navbar() {
  const menuItems = await getMenuItems();
  const settings = await getSiteSettings();

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 container mx-auto px-4 min-h-20 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {settings.logoUrl ? (
            <div className="relative h-16 w-auto">
              <Image
                src={settings.logoUrl}
                alt="Reading Civic Theatre"
                width={0}
                height={0}
                sizes="100vw"
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
          ) : (
            <div className="bg-primary text-primary-foreground font-bold text-2xl px-3 py-1 rounded-sm">
              RCT
            </div>
          )}
        </Link>

        {/* Desktop Navigation */}
        <NavbarMenu items={menuItems} />

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
        <div className="w-full border-t bg-background relative h-[100px]">
          <Image
            src={settings.headerBannerUrl}
            alt="Header Banner"
            fill
            className="object-fill"
            priority
            sizes="100vw"
          />
        </div>
      )}
    </header>
  );
}
