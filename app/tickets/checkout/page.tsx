
import { CheckoutForm } from "@/components/tickets/checkout-form";
import PublicLayout from "@/components/layout/PublicLayout";

export default function CheckoutPage() {
  return (
    <PublicLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Secure Checkout</h1>
        <CheckoutForm />
      </div>
    </PublicLayout>
  );
}
