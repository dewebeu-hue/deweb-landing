import type { Metadata } from "next";
import { deploymentRobots, SITE_ORIGIN } from "../lib/seo-policy";
import "@fontsource-variable/dm-sans";
import "./globals.css";
import "./surfaces.css";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

// Every HTML document must be rendered with the nonce for its own response.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: "deweb — Web-stranice i poslovne aplikacije po mjeri",
  description:
    "deweb izrađuje i redizajnira poslovne web-stranice te razvija interne alate i poslovne aplikacije po mjeri.",
  robots: deploymentRobots(process.env.VERCEL_ENV),
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hr">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
