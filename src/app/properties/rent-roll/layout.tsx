import React from "react";
import SubscriptionGate from "@/components/SubscriptionGate";

export default function RentRollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SubscriptionGate
      fallbackLandingPage="/properties"
      portalName="Rent Roll & Revenue Management"
    >
      {children}
    </SubscriptionGate>
  );
}
