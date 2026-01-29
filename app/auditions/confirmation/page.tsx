import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">You're Signed Up!</h1>
        <p className="text-xl text-muted-foreground max-w-lg mx-auto mb-8">
          Thank you for signing up to audition. We have sent a confirmation
          email with all the details. Break a leg!
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auditions">View More Slots</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
