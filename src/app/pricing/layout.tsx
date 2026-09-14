import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Pricing — Plans & Commercials Coming Soon",
  description: "Official public pricing for OfficeX ecosystem is coming soon. Request bespoke commercial proposals and early pilot access today.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
