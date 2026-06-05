import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "deweb — Digitalna rješenja za male poduzetnike",
  description:
    "Opišite poslovni problem. deweb predlaže izvediva digitalna rješenja i izrađuje MVP, interni alat ili custom rješenje za male poduzetnike.",
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
