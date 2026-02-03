# Payment Implementation Walkthrough (Stripe)

This guide outlines the steps required to transition the current "simulation" payment system to a live, secure payment processor using **Stripe**.

## 1. Prerequisites & Account Setup

1.  **Create Stripe Account**: Go to [dashboard.stripe.com](https://dashboard.stripe.com/register) and sign up.
2.  **Get API Keys**:
    *   Navigate to **Developers** > **API Keys**.
    *   Copy the **Publishable Key** (starts with `pk_test_...`).
    *   Copy the **Secret Key** (starts with `sk_test_...`).
3.  **Environment Variables**:
    Add these to your `.env` file (do not commit this file):

    ```env
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_... (You get this later in Step 5)
    ```

## 2. Installation

Install the official Stripe libraries for Node.js and React:

```bash
npm install stripe @stripe/stripe-js @stripe/react-stripe-js
```

## 3. Backend Configuration

Create a singleton instance of Stripe to use across your server actions.

**File:** `lib/stripe.ts`

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest version available
  typescript: true,
});
```

## 4. Implementation Strategy

We will use Stripe's **Payment Element**, which automatically handles UI for card numbers, Apple Pay, Google Pay, etc.

### Step A: Create Payment Intent (Server Side)

When the user arrives at the checkout page (or when they click "Checkout"), we need to tell Stripe "We intend to collect $X".

**Update:** `app/actions/tickets.ts`

Add a new function:

```typescript
import { stripe } from "@/lib/stripe";

export async function createPaymentIntent(amount: number) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects cents
    currency: "usd",
    automatic_payment_methods: { enabled: true },
  });

  return { clientSecret: paymentIntent.client_secret };
}
```

### Step B: The Payment Wrapper (Client Side)

We need to wrap our checkout form in Stripe's context provider.

**Update:** `components/tickets/checkout-form.tsx`

```tsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Load key outside component to avoid recreation
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutForm() {
  const [clientSecret, setClientSecret] = useState("");

  // 1. On mount, ask server to create a PaymentIntent
  useEffect(() => {
    if (selection) {
       createPaymentIntent(selection.total).then(res => setClientSecret(res.clientSecret));
    }
  }, [selection]);

  if (!clientSecret) return <LoadingSpinner />;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentFormInner />
    </Elements>
  );
}

function PaymentFormInner() {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;

    // 2. Confirm Payment with Stripe
    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // Prevents full page redirect if not needed
    });

    if (result.error) {
      // Show error to user
      console.error(result.error.message);
    } else {
      // 3. Payment Succeeded! Now save to DB.
      // Call your existing createOrder action here
      // Pass result.paymentIntent.id to store in DB
      await createOrder(..., { paymentIntentId: result.paymentIntent.id });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Replaces your custom Card Inputs */}
      <PaymentElement /> 
      <Button type="submit">Pay Now</Button>
    </form>
  );
}
```

### Step C: Verify Payment in Database (Server Side)

**Update:** `app/actions/tickets.ts` -> `createOrder`

Modify `createOrder` to verify the payment actually happened before giving tickets. Never trust the client alone.

```typescript
export async function createOrder(..., paymentIntentId: string) {
  // 1. Retrieve the intent from Stripe to verify status
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    throw new Error("Payment has not been verified.");
  }

  // 2. Proceed with Prisma Transaction (existing logic)
  // ...
}
```

## 5. Webhooks (Robustness)

If the user's browser closes *after* payment but *before* the database saves the order, you need a backup.

1.  **Create Endpoint**: `app/api/webhooks/route.ts`
2.  **Logic**: Listen for `payment_intent.succeeded`.
3.  **Action**: Check if the Order exists in Prisma. If not, create it (you'll need to pass metadata like `seatIds` to the PaymentIntent in Step A so the webhook knows what was bought).

## 6. Testing

*   Use Stripe's [Test Card Numbers](https://stripe.com/docs/testing).
    *   **4242 4242 4242 4242** (Visa, Success)
    *   **4000 0000 0000 0002** (Decline)
*   Verify that declined cards show errors on the form.
*   Verify that successful cards create Prisma records.
