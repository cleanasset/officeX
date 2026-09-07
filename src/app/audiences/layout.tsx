import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX — Curated Stakeholder Journeys",
  description: "Tailored operational journeys, permissions, and toolkits for Property Owners, Corporate Occupiers, Facility Managers, Vendors, Investors, and IT teams.",
};

export default function AudiencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
