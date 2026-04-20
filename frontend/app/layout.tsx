import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "Luxury-Car-SaaS",
  description: "Premium foundation for a luxury car dealer SaaS platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">{children}</main>
      </body>
    </html>
  );
}
