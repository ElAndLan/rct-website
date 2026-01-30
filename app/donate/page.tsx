import PublicLayout from "@/components/layout/PublicLayout";
import { getSiteSettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Donate | Reading Civic Theatre",
  description: "Support Reading Civic Theatre with a donation.",
};

export default async function DonatePage() {
  const settings = await getSiteSettings();

  const title = settings.donationTitle || "Support Reading Civic Theatre";
  const body = settings.donationBody || "Your generous donations help us continue to bring high-quality community theatre to Reading. Thank you for your support!";
  const paypalLink = settings.donationPaypalLink || "#";
  const imageUrl = settings.donationImageUrl;

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-card border rounded-xl overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
                {/* Image Section */}
                <div className="bg-muted relative min-h-[300px] md:min-h-full">
                    {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={imageUrl}
                            alt="Donate to RCT"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 text-primary">
                            <Heart className="w-24 h-24 opacity-20" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold mb-6">{title}</h1>
                    
                    <div className="prose prose-lg text-muted-foreground mb-8 whitespace-pre-wrap">
                        {body}
                    </div>

                    <Button size="lg" className="w-full text-lg h-14" asChild>
                        <Link href={paypalLink} target="_blank" rel="noopener noreferrer">
                            <Heart className="mr-2 h-5 w-5 fill-current" />
                            Donate via PayPal
                        </Link>
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        You will be redirected to PayPal to complete your secure donation.
                    </p>
                </div>
            </div>
        </div>
      </div>
    </PublicLayout>
  );
}
