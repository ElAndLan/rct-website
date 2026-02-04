"use client";

import { useState } from "react";
import { SeatWithStatus } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Accessibility, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SeatSelectorProps {
  performanceId: string;
  showTitle: string;
  performanceDate: Date;
  seats: SeatWithStatus[];
  basePrice: number;
}

export function SeatSelector({
  performanceId,
  showTitle,
  performanceDate,
  seats,
  basePrice,
}: SeatSelectorProps) {
  const router = useRouter();
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(
    new Set(),
  );

  const toggleSeat = (seatId: string) => {
    const newSelected = new Set(selectedSeatIds);
    if (newSelected.has(seatId)) {
      newSelected.delete(seatId);
    } else {
      newSelected.add(seatId);
    }
    setSelectedSeatIds(newSelected);
  };

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];

  // Group seats by row
  const seatsByRow = rows.reduce(
    (acc, row) => {
      // Sort descending (b.number - a.number) so Seat 1 is on the Right
      acc[row] = seats
        .filter((s) => s.row === row)
        .sort((a, b) => b.number - a.number);
      return acc;
    },
    {} as Record<string, SeatWithStatus[]>,
  );

  const subtotal = selectedSeatIds.size * basePrice;
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  const handleCheckout = () => {
    // Save selection to localStorage or URL params
    const selection = {
      performanceId,
      seatIds: Array.from(selectedSeatIds),
      total,
    };
    localStorage.setItem("ticket_selection", JSON.stringify(selection));
    router.push("/tickets/checkout");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
      <div className="bg-card border rounded-xl p-8 overflow-x-auto">
        {/* Stage */}
        <div className="mb-12">
          <div className="w-2/3 mx-auto h-12 bg-muted rounded-b-[50%] flex items-center justify-center text-muted-foreground font-bold tracking-widest border-b border-x shadow-sm">
            STAGE
          </div>
        </div>

        {/* Seats Grid */}
        <div className="flex flex-col gap-2 min-w-[600px] items-center">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-4">
              <div className="w-6 text-center font-bold text-muted-foreground">
                {row}
              </div>
              <div className="flex gap-1.5 justify-center flex-1">
                {/* Sound Booth for J/K - One Big Box */}
                {row === "J" && (
                  <div className="w-[120px] h-[calc(200%_+_0.5rem)] bg-muted border flex items-center justify-center text-[10px] font-bold text-muted-foreground rounded z-10 mr-2 shadow-sm">
                    SOUND BOOTH
                  </div>
                )}
                {row === "K" && (
                  <div
                    className="w-[120px] h-8 mr-2 invisible"
                    aria-hidden="true"
                  />
                )}

                {seatsByRow[row].map((seat) => {
                  const isSelected = selectedSeatIds.has(seat.id);
                  const isSold = seat.status === "SOLD";
                  const isAccessible = seat.category === "ACCESSIBLE";

                  return (
                    <button
                      key={seat.id}
                      disabled={isSold}
                      onClick={() => toggleSeat(seat.id)}
                      className={cn(
                        "w-8 h-8 rounded-t-md text-[10px] font-medium flex items-center justify-center transition-all relative group border-x border-t border-b-2",
                        isSold
                          ? "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50"
                          : isSelected
                            ? "bg-primary text-primary-foreground border-primary-foreground translate-y-[-2px] shadow-md"
                            : isAccessible
                              ? "bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200"
                              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400",
                      )}
                      title={`Row ${seat.row} Seat ${seat.number}${isAccessible ? " (Accessible)" : ""}`}
                    >
                      {isSold ? (
                        <X className="w-4 h-4" />
                      ) : isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : isAccessible ? (
                        <Accessibility className="w-4 h-4" />
                      ) : (
                        seat.number
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="w-6 text-center font-bold text-muted-foreground">
                {row}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border bg-white"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border bg-primary"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border bg-muted opacity-50 flex items-center justify-center">
              <X className="w-3 h-3" />
            </div>
            <span>Sold</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border bg-blue-100 flex items-center justify-center">
              <Accessibility className="w-3 h-3 text-blue-700" />
            </div>
            <span>Accessible</span>
          </div>
        </div>
      </div>

      {/* Summary Sidebar */}
      <div className="bg-card border rounded-xl p-6 sticky top-24">
        <h3 className="text-xl font-bold mb-4">Your Selection</h3>
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-muted-foreground text-sm">Show</p>
            <p className="font-medium">{showTitle}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Date</p>
            <p className="font-medium">
              {new Date(performanceDate).toLocaleString()}
            </p>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>
                {selectedSeatIds.size} Ticket
                {selectedSeatIds.size !== 1 ? "s" : ""}
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-muted-foreground text-sm">
              <span>PA Tax (6%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={selectedSeatIds.size === 0}
          onClick={handleCheckout}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
