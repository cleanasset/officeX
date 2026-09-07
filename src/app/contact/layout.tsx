import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact OfficeX — Talk to Our Team",
  description: "Reach the OfficeX team for a demo, partnership, or enquiry. We respond within 24 business hours.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
