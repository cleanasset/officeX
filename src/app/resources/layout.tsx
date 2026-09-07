import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Resources — CRE & FM Insights",
  description: "Industry benchmark reports, operational playbooks, case studies, and statutory compliance guides for commercial real estate.",
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
