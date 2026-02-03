"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItem {
  id: string;
  label: string;
  path: string | null;
  children: MenuItem[];
}

interface NavDropdownProps {
  item: MenuItem;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function NavDropdown({ item, isOpen, onOpen, onClose }: NavDropdownProps) {
  const [isLocked, setIsLocked] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // If isOpen becomes false (e.g. parent closed it), reset lock
  useEffect(() => {
    if (!isOpen) {
      setIsLocked(false);
    }
  }, [isOpen]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onOpen();
  };

  const handleMouseLeave = () => {
    if (isLocked) return;
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLocked) {
      // If already locked, unlock and close
      setIsLocked(false);
      onClose();
    } else {
      // If not locked, lock and open
      setIsLocked(true);
      onOpen();
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Radix is telling us to close (click outside, escape, etc)
      onClose();
      setIsLocked(false);
    } else {
      onOpen();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group inline-flex h-9 w-max items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          {item.label}
          <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-300 group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {item.children.map((child) => (
          <DropdownMenuItem key={child.id} asChild>
            <Link
              href={child.path || "#"}
              className="w-full cursor-pointer"
              onClick={() => {
                // When a link is clicked, we should close
                onClose();
                setIsLocked(false);
              }}
            >
              {child.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
