import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/config";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — YouTube Analytics for Creators`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type:        "website",
    siteName:    SITE_NAME,
    title:       `${SITE_NAME} — YouTube Analytics for Creators`,
    description: SITE_DESCRIPTION,
    url:         SITE_URL,
  },
  twitter: {
    card:        "summary_large_image",
    title:       `${SITE_NAME} — YouTube Analytics for Creators`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        <ThemeProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}