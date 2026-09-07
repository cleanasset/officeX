import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Intelligence — CRE Analytics",
  description: "Portfolio NOI, WALE, ESG reporting, energy benchmarking, and AI-powered insights for commercial real estate investors.",
};

export default function IntelligenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
