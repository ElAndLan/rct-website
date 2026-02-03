import { getSiteSettings } from "@/app/actions/settings";
import Link from "next/link";
import { Lock, Facebook, Instagram } from "lucide-react";

export async function Footer() {
  const settings = await getSiteSettings();
  const footerLinks = settings.footerLinks
    ? JSON.parse(settings.footerLinks)
    : [];

  return (
    <footer className="bg-secondary text-secondary-foreground py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold mb-4">Reading Civic Theatre</h3>
            <p className="text-sm opacity-80 whitespace-pre-wrap">
              {settings.footerDescription ||
                "Bringing the arts to life in our community."}
            </p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm opacity-80">
              {settings.contactAddress1 || "123 Theatre Lane"}
            </p>
            <p className="text-sm opacity-80">
              {settings.contactAddress2 || "Cityville, ST 12345"}
            </p>
            {settings.contactEmail && (
              <p className="text-sm opacity-80 mt-2">
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="hover:underline"
                >
                  {settings.contactEmail}
                </a>
              </p>
            )}
            {!settings.contactEmail && (
              <p className="text-sm opacity-80 mt-2">
                info@readingcivictheatre.com
              </p>
            )}
          </div>

          {/* Column 3: Links */}
          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm opacity-80">
              {footerLinks.map(
                (link: { label: string; url: string }, index: number) => (
                  <li key={index}>
                    <Link
                      href={link.url}
                      className="hover:underline hover:opacity-100 transition-opacity"
                    >
                      {link.label}
                    </Link>
                  </li>
                ),
              )}
              {footerLinks.length === 0 && (
                <>
                  <li>
                    <Link href="/about" className="hover:underline">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/shows" className="hover:underline">
                      Current Season
                    </Link>
                  </li>
                  <li>
                    <Link href="/donate" className="hover:underline">
                      Donate
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-foreground hover:text-primary transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {!settings.socialFacebook && !settings.socialInstagram && (
                <span className="text-sm opacity-80">
                  Social links not configured.
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8 flex justify-between items-center">
          <p className="text-xs opacity-60">
            &copy; {new Date().getFullYear()}{" "}
            {settings.footerCopyright ||
              "Reading Civic Theatre. All rights reserved."}
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
