"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  formatPhoneNumber,
  formatCardExpiry,
  formatCardNumber,
  formatZipCode,
} from "@/lib/formatters";

// Luhn Algorithm for Card Validation
const luhnCheck = (val: string) => {
  let checksum = 0;
  let j = 1;
  for (let i = val.length - 1; i >= 0; i--) {
    let calc = 0;
    calc = Number(val.charAt(i)) * j;
    if (calc > 9) {
      checksum = checksum + 1;
      calc = calc - 10;
    }
    checksum = checksum + calc;
    j = j === 1 ? 2 : 1;
  }
  return checksum % 10 === 0;
};

const getCardType = (number: string) => {
  const re = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
  };
  if (re.visa.test(number)) return "Visa";
  if (re.mastercard.test(number)) return "Mastercard";
  if (re.amex.test(number)) return "American Express";
  if (re.discover.test(number)) return "Discover";
  return "Unknown";
};

interface TicketSelection {
  performanceId: string;
  seatIds: string[];
  total: number;
}

export function CheckoutForm() {
  const router = useRouter();
  const [selection, setSelection] = useState<TicketSelection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    zip: "",
  });

  const [cardType, setCardType] = useState("Unknown");

  useEffect(() => {
    const stored = localStorage.getItem("ticket_selection");
    if (!stored) {
      router.push("/tickets");
      return;
    }
    setSelection(JSON.parse(stored));
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "cardNumber") {
      value = formatCardNumber(value);
      const clean = value.replace(/\D/g, "");
      setCardType(getCardType(clean));
    } else if (name === "phone") {
      value = formatPhoneNumber(value);
    } else if (name === "expiry") {
      value = formatCardExpiry(value);
    } else if (name === "zip") {
      value = formatZipCode(value);
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Basic Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone
    ) {
      setError("Please fill in all personal information.");
      setLoading(false);
      return;
    }

    // 2. Card Validation
    const cleanCard = formData.cardNumber.replace(/\D/g, "");
    if (!luhnCheck(cleanCard)) {
      setError("Invalid Credit Card Number. Please check and try again.");
      setLoading(false);
      return;
    }

    if (!selection) {
      setError("No tickets selected.");
      setLoading(false);
      return;
    }

    // 3. Process Order
    try {
      const result = await createOrder(
        selection.performanceId,
        selection.seatIds,
        {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          last4: formData.cardNumber.replace(/\D/g, "").slice(-4),
        },
      );

      if (result.success && result.orderId) {
        // Clear cart
        localStorage.removeItem("ticket_selection");
        // Redirect to success
        router.push(`/tickets/success?orderId=${result.orderId}`);
      } else {
        setError(result.error || "Payment processing failed.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!selection) return null;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>
              Secure, encrypted transaction. No card data is stored.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Card Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  name="cardNumber"
                  className="pl-9"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  required
                />
                {formData.cardNumber.length > 4 && (
                  <div className="absolute right-3 top-3 text-xs font-bold text-muted-foreground">
                    {cardType}
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Expiry</Label>
                <Input
                  name="expiry"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={formData.expiry}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>CVC</Label>
                <Input
                  name="cvc"
                  placeholder="123"
                  maxLength={4}
                  value={formData.cvc}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Zip Code</Label>
                <Input
                  name="zip"
                  placeholder="12345"
                  maxLength={5}
                  value={formData.zip}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>{selection.seatIds.length} Tickets</span>
              <span>${(selection.total / 1.06).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Taxes & Fees</span>
              <span>
                ${(selection.total - selection.total / 1.06).toFixed(2)}
              </span>
            </div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${selection.total.toFixed(2)}</span>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Payment Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                `Pay $${selection.total.toFixed(2)}`
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
