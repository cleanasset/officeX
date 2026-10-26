"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RentRollOnboardingWizard, { OnboardingCompleteData } from "@/components/rent-roll/RentRollOnboardingWizard";
import { getClientAuthHeaders } from "@/lib/auth-storage";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || undefined;

  const handleOnboardingComplete = async (data: OnboardingCompleteData) => {
    // 1. Commit complete workspace hierarchy to database
    try {
      const commitRes = await fetch("/api/rent-roll/onboarding-commit", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getClientAuthHeaders() },
        body: JSON.stringify({
          businessModel: data.businessModel,
          companyName: data.companyName,
          brandName: data.brandName,
          role: data.role,
          spvs: data.spvs,
          chargeTypes: data.chargeTypes,
          property: {
            propertyName: data.propertyName,
            propertyCode: data.propertyCode,
            propertyType: data.propertyType,
            grade: data.buildingGrade,
            totalLeasableAreaSqft: data.areaSqft,
            carpetAreaSqft: data.carpetAreaSqft,
            floors: data.floorsCount,
            unitsPerFloor: data.unitsPerFloor,
            askingRatePerSqft: data.askingRatePerSqft,
            city: data.city,
            state: data.state,
            microMarket: data.microMarket,
            pincode: data.pincode,
            address: data.address,
            buildingName: data.buildingName,
            fitoutCondition: data.fitoutCondition,
          },
          team: {
            role: data.role,
            delegatedManager: data.hasDelegatedManager
              ? {
                  name: data.managerName,
                  email: data.managerEmail,
                  type: data.managerType,
                  role: data.managerUserRole,
                  delegationScope: data.delegationScope,
                }
              : undefined,
          },
        }),
      });

      if (!commitRes.ok) {
        const errorJson = await commitRes.json();
        throw new Error(errorJson.message || "Failed to commit onboarding workspace hierarchy.");
      }

      const resData = await commitRes.json();

      // 2. Persist local storage & cookies for immediate frontend state alignment
      if (typeof window !== "undefined") {
        localStorage.setItem("officex_rentroll_onboarded", "true");
        localStorage.setItem("officex_onboarding_completed", "1");
        sessionStorage.setItem("officex_onboarding_completed", "1");
        document.cookie = "officex_onboarding_completed=1; path=/; max-age=2592000; SameSite=Lax";

        if (resData.orgId) {
          localStorage.setItem("officex_org_id", resData.orgId);
          document.cookie = `officex_org_id=${resData.orgId}; path=/; max-age=2592000; SameSite=Lax`;
        }
        if (resData.clientAccountId) {
          localStorage.setItem("officex_client_account_id", resData.clientAccountId);
          document.cookie = `officex_client_account_id=${resData.clientAccountId}; path=/; max-age=2592000; SameSite=Lax`;
        }

        localStorage.setItem("officex_role_key", data.role);
        sessionStorage.setItem("officex_role_key", data.role);
        document.cookie = `officex_role_key=${encodeURIComponent(data.role)}; path=/; max-age=2592000; SameSite=Lax`;

        localStorage.setItem("officex_company_name", data.companyName);
        localStorage.setItem("officex_brand_name", data.brandName);
        localStorage.setItem("officex_subscription", "active");
        sessionStorage.setItem("officex_subscription", "active");
        document.cookie = "officex_subscription=active; path=/; max-age=2592000; SameSite=Lax";

        localStorage.setItem("officex_active_property", data.propertyName);
        if (resData.propertyId) {
          localStorage.setItem("officex_active_property_id", resData.propertyId);
        }

        // Delegated Manager details
        if (data.hasDelegatedManager) {
          localStorage.setItem("officex_has_manager", "true");
          localStorage.setItem("officex_manage_mode", "delegated");
          localStorage.setItem("officex_manager_name", data.managerName || "");
          localStorage.setItem("officex_manager_email", data.managerEmail || "");
        } else {
          localStorage.setItem("officex_manage_mode", "self");
          localStorage.removeItem("officex_has_manager");
        }
      }

      // 3. Clean Transition Directly to Active Rent Roll Register
      router.push("/properties/rent-roll?tab=register");
    } catch (err: any) {
      console.error("Onboarding completion error:", err);
      throw err;
    }
  };

  const handleSkip = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_rentroll_onboarded", "true");
      localStorage.setItem("officex_onboarding_completed", "1");
      sessionStorage.setItem("officex_onboarding_completed", "1");
      document.cookie = "officex_onboarding_completed=1; path=/; max-age=86400; SameSite=Lax";
    }
    router.push("/properties/rent-roll?tab=register");
  };

  return (
    <div className="min-h-screen bg-slate-900 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-5xl">
        <RentRollOnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleSkip}
          initialRole={initialRole}
        />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center font-bold text-slate-300">
          Loading Commercial Onboarding Suite...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
