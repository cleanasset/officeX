import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Pricing — Plans for Every Scale",
  description: "Transparent pricing for Marketplace, Operate, Manage, Intelligence, and Managed Services. Starter free. Professional from ₹4,999/month.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
