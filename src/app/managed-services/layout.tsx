import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Managed Services — PM & FM",
  description: "End-to-end property and facility management by OfficeX — SLA-backed, digitally tracked, with monthly MIS reports.",
};

export default function ManagedServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
