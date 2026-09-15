import type { Metadata } from "next";
import { deploymentRobots, SITE_ORIGIN } from "../lib/seo-policy";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
