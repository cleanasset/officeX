import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Operate — FM Operations Platform",
  description: "Automate 52-week PPM, enforce SLAs, and manage helpdesk tickets for Grade-A commercial buildings. Built for facility managers.",
};

export default function OperateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
