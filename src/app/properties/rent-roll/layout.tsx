import React from "react";
import SubscriptionGate from "@/components/SubscriptionGate";

export const metadata = {
  title: "Rent Roll Master | OfficeX",
  description: "Enterprise commercial rent roll, lease escalations, and CAM billing engine.",
};

export default function RentRollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionGate portalName="Rent Roll Master" fallbackLandingPage="/operate/rent-roll">
      {children}
    </SubscriptionGate>
  );
}
