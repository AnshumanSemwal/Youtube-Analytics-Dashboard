import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title:       "Privacy Policy",
  description: "How YT Analytics handles your data and YouTube credentials.",
  alternates:  { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 px-6 py-16">
      <div className="max-w-2xl mx-auto">

        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mb-8 inline-block transition-colors"
        >
          Back to home
        </Link>

        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: July 2025</p>

        <div className="prose prose-gray dark:prose-invert max-w-none text-sm leading-relaxed space-y-6 text-gray-600 dark:text-gray-400">
          <p>
            YT Analytics connects to your YouTube channel via Google OAuth and
            displays your analytics data in a clean dashboard. We request
            read-only access to your YouTube data and analytics. We never post
            to your channel, modify your account, or share your data with third
            parties.
          </p>
          <p>
            We store your Google account information (name, email, profile
            photo) and your YouTube channel statistics in a secure database to
            power the dashboard. Your OAuth tokens are stored securely and used
            only to fetch your YouTube data on your behalf. You can disconnect
            your channel and delete all stored data at any time from the
            Settings page.
          </p>
          <p>
            We do not sell your data. We do not run ads. This is an independent
            tool built for YouTubers and is not affiliated with or endorsed by
            YouTube or Google.
          </p>
          <p>
            For questions or data deletion requests, contact us at{" "}
            
            <a
              href="mailto:hello@yourdomain.com"
              className="underline hover:text-gray-900 dark:hover:text-white"
            >
              hello@yourdomain.com
            </a>
            .
            </p>
          
        </div>

      </div>
    </div>
  );
}