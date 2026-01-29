import Link from "next/link";
import { getMenuItems } from "@/app/actions/menu";
import { getSiteSettings } from "@/app/actions/settings";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu-styles";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export async function Navbar() {
  const menuItems = await getMenuItems();
  const settings = await getSiteSettings();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
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
        <div className="hidden md:block">
          <NavigationMenu>
            <NavigationMenuList>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  {item.children.length > 0 ? (
                    <>
                      <NavigationMenuTrigger>
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="flex flex-col w-[300px] gap-2 p-4 bg-popover">
                          {item.children.map((child) => (
                            <li key={child.id}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.path || "#"}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.label}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <Link href={item.path || "#"}>{item.label}</Link>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    {item.children.length > 0 ? (
                      <>
                        <div className="font-semibold text-lg border-b pb-2">
                          {item.label}
                        </div>
                        <div className="pl-4 flex flex-col gap-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.id}
                              href={child.path || "#"}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.path || "#"}
                        className="font-semibold text-lg border-b pb-2"
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
    </header>
  );
}
