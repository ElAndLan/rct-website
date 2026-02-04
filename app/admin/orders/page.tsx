"use client";

import { getAllOrders } from "@/app/actions/admin-orders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Orders = Awaited<ReturnType<typeof getAllOrders>>["orders"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Orders | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllOrders().then((result) => {
      if (result.success && result.orders) {
        setOrders(result.orders);
      } else {
        setError(result.error || "Failed to fetch orders");
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !orders) {
    return (
      <div className="p-8 text-red-500">
        {error || "Failed to load orders. Please try again later."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ticket Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Card (Last 4)</TableHead>
                <TableHead>Show</TableHead>
                <TableHead>Show Date</TableHead>
                <TableHead>Seats</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                // Group seats by show if needed, but usually an order is for one performance?
                // The schema allows tickets for different performances in one order technically,
                // but our checkout flow does one performance at a time.
                // We'll just map all tickets.

                // We can assume all tickets in the current flow are for the same show,
                // but let's be safe and get unique show titles.
                const shows = Array.from(
                  new Set(order.tickets.map((t) => t.performance.show.title)),
                );

                const performanceDates = Array.from(
                  new Set(
                    order.tickets.map(
                      (t) =>
                        new Date(t.performance.date).toLocaleDateString() +
                        " " +
                        new Date(t.performance.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                    ),
                  ),
                );

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">
                        {order.customerEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono">
                        {order.last4 ? `**** ${order.last4}` : "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {shows.map((title) => (
                        <div key={title} className="font-medium">
                          {title}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      {performanceDates.map((date) => (
                        <div key={date} className="text-sm">
                          {date}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {order.tickets.map((ticket) => (
                          <Badge key={ticket.id} variant="secondary">
                            Row {ticket.seat.row} - {ticket.seat.number}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${Number(order.totalAmount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
