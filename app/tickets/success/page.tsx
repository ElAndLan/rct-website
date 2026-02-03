import { getOrder } from "@/app/actions/tickets";
import PublicLayout from "@/components/layout/PublicLayout";
import { PrintButton } from "@/components/ui/print-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  searchParams: Promise<{ orderId: string }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  if (!orderId) return notFound();

  const order = await getOrder(orderId);
  if (!order) return notFound();

  return (
    <PublicLayout>
      <div className="container min-h-[80vh] flex items-center justify-center py-12 translate-x-[75px]">
        <Card className="border-green-200 bg-green-50/50 w-full max-w-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Thank you, {order.customerName}. Your order has been processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <p className="font-bold text-lg">
                    Order #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.createdAt.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${Number(order.totalAmount).toFixed(2)}
                  </p>
                  <p className="text-xs uppercase bg-green-100 text-green-800 px-2 py-1 rounded inline-block mt-1">
                    Paid
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Your Tickets</h3>
                {order.tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex justify-between items-center p-3 bg-muted/50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {ticket.performance.show.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ticket.performance.date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        Row {ticket.seat.row} - Seat {ticket.seat.number}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ticket.seat.category}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground pt-1">Billed To:</span>
                  <div className="text-right">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-muted-foreground">
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">
                    Card ending in {order.last4 || "****"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 justify-center">
            <PrintButton />
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PublicLayout>
  );
}
