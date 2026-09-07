import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OfficeX Platform Core — Unified Data Foundation",
  description: "Enterprise-grade platform core powering identity, billing, integrations, security, and SLAs across all OfficeX modules.",
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
