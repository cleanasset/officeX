import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import CookieConsent from "@/components/marketing/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "OfficeX — The Modern CRE & FM Ecosystem",
  description: "The integrated platform for commercial real estate, facility management, workplace operations, and intelligent property services.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F8B7D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground overflow-x-hidden w-full max-w-full">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
