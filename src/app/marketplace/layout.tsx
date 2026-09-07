import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Marketplace — Space & FM Services",
  description: "Discover verified commercial spaces and FM service vendors. Structured RFQs, BOQ generation, escrow payments. Powered by OfficeX.",
};

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
