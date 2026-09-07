import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Manage — Property Management SaaS",
  description: "Automate rent roll, CAM billing, compliance tracking, and MIS reporting for Indian commercial property portfolios.",
};

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
