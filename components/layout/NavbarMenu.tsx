"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NavDropdown } from "@/components/layout/NavDropdown";

interface MenuItem {
  id: string;
  label: string;
  path: string | null;
  children: MenuItem[];
}

interface NavbarMenuProps {
  items: MenuItem[];
}

export function NavbarMenu({ items }: NavbarMenuProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <nav className="hidden lg:flex flex-1 justify-end ml-4">
      <ul className="flex flex-wrap justify-end gap-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-center">
            {item.children.length > 0 ? (
              <NavDropdown 
                item={item} 
                isOpen={openId === item.id}
                onOpen={() => setOpenId(item.id)}
                onClose={() => setOpenId((prev) => prev === item.id ? null : prev)}
              />
            ) : (
              <Button
                asChild
                variant="ghost"
                className="h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
                onMouseEnter={() => setOpenId(null)} // Close any open dropdowns when hovering a regular link
              >
                <Link href={item.path || "#"}>{item.label}</Link>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
