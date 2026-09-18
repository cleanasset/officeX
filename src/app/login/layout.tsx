import type { Metadata, Viewport } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Sign in · OfficeX',
  description: 'Secure, single-sign-on access to the OfficeX enterprise commercial real estate and facilities management platform.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0B1F3A', // Official OfficeX Brand Deep Navy
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-[#081325] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">{children}</div>;
}
