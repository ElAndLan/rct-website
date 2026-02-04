import PublicLayout from "@/components/layout/PublicLayout";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import SuccessContent from "./success-content";

export const metadata = {
  title: "Order Success | Reading Civic Theatre",
  description: "Your order has been processed successfully.",
};

export default function SuccessPage() {
  return (
    <PublicLayout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin" />
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </PublicLayout>
  );
}
