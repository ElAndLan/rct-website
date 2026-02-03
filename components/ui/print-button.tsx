
"use client";

import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="w-4 h-4 mr-2" /> Print Receipt
    </Button>
  );
}
