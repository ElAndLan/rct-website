import Link from "next/link";
import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Reading Civic Theatre</h3>
            <p className="text-sm opacity-80">
              Bringing the arts to life in our community.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm opacity-80">123 Theatre Lane</p>
            <p className="text-sm opacity-80">Cityville, ST 12345</p>
            <p className="text-sm opacity-80 mt-2">
              info@readingcivictheatre.com
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {/* Social icons would go here */}
              <span className="text-sm opacity-80">Facebook</span>
              <span className="text-sm opacity-80">Instagram</span>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8 flex justify-between items-center">
          <p className="text-xs opacity-60">
            &copy; {new Date().getFullYear()} Reading Civic Theatre. All rights
            reserved.
          </p>

          {/* Subtle Admin Login Link */}
          <Link
            href="/admin"
            className="text-xs opacity-40 hover:opacity-100 transition-opacity flex items-center gap-1"
            aria-label="Admin Access"
          >
            <Lock className="h-3 w-3" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
