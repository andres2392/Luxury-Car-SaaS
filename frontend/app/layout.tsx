import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
