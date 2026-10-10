"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RentRollOnboardingWizard, { OnboardingCompleteData } from "@/components/rent-roll/RentRollOnboardingWizard";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleOnboardingComplete = async (data: OnboardingCompleteData) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("officex_rentroll_onboarded", "true");
      localStorage.setItem("officex_onboarding_completed", "1");
      sessionStorage.setItem("officex_onboarding_completed", "1");
      document.cookie = "officex_onboarding_completed=1; path=/; max-age=86400; SameSite=Lax";

      localStorage.setItem("officex_role_key", data.role);
      sessionStorage.setItem("officex_role_key", data.role);
      document.cookie = `officex_role_key=${encodeURIComponent(data.role)}; path=/; max-age=86400; SameSite=Lax`;

      // Organization & Branding (§S-60)
      localStorage.setItem("officex_company_name", data.companyName);
      localStorage.setItem("officex_brand_name", data.brandName);
      if (data.logoUrl) {
        localStorage.setItem("officex_brand_logo", data.logoUrl);
      }

      // Owner Delegation Data (Fetched in complete profile hub)
      if (data.hasDelegatedManager) {
        localStorage.setItem("officex_has_manager", "true");
        localStorage.setItem("officex_manager_type", data.managerType || "pm_company");
        if (data.managerUserRole) {
          localStorage.setItem("officex_manager_user_role", data.managerUserRole);
        } else {
          localStorage.removeItem("officex_manager_user_role");
        }
        localStorage.setItem("officex_manager_name", data.managerName || "");
        localStorage.setItem("officex_manager_email", data.managerEmail || "");
        localStorage.setItem("officex_manager_status", "activated");
        localStorage.setItem("officex_manager_dashboard_activated", "true");
        const inviteUrl = `https://www.officex.pro/dashboard/pm?role=${encodeURIComponent(data.managerType || "pm_company")}&mgr=${encodeURIComponent(data.managerName || "")}&invite=act_${Date.now()}`;
        localStorage.setItem("officex_manager_activation_link", inviteUrl);

        // Pre-assign manager to initial property
        if (data.propertyName) {
          const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
          currentAssigns[data.propertyName] = {
            name: data.managerName,
            email: data.managerEmail || "",
            type: data.managerType || "pm_company",
            userRole: data.managerUserRole || undefined,
            assignedAt: new Date().toISOString(),
          };
          localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
        }
      } else {
        localStorage.removeItem("officex_has_manager");
        localStorage.removeItem("officex_manager_type");
        localStorage.removeItem("officex_manager_user_role");
        localStorage.removeItem("officex_manager_name");
        localStorage.removeItem("officex_manager_email");
        localStorage.removeItem("officex_manager_activation_link");
        localStorage.removeItem("officex_manager_dashboard_activated");
      }

      localStorage.setItem("officex_active_property", data.propertyName);
      if (data.propertyName) {
        const regNames = JSON.parse(localStorage.getItem("officex_registered_property_names") || "[]");
        if (!regNames.includes(data.propertyName)) {
          regNames.push(data.propertyName);
          localStorage.setItem("officex_registered_property_names", JSON.stringify(regNames));
        }
      }
      if (data.areaSqft) localStorage.setItem("officex_used_sqft", String(data.areaSqft));

      // Map role to label
      const roleLabels: Record<string, string> = {
        owner: "Commercial Property Owner / Landlord",
        property_manager: "Property Manager / Centre Manager",
        facility_manager: "Facility Manager / Site Operations Lead",
        leasing_manager: "Commercial Leasing Manager / Broker",
        finance_manager: "CA / Financial Controller",
      };
      const label = roleLabels[data.role] || "Commercial Property Owner";
      localStorage.setItem("officex_user_role", label);
      sessionStorage.setItem("officex_user_role", label);
      document.cookie = `officex_user_role=${encodeURIComponent(label)}; path=/; max-age=86400; SameSite=Lax`;
    }

    // Persist property in database
    try {
      const propRes = await fetch("/api/rent-roll/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_name: data.propertyName,
          property_code: data.propertyCode,
          property_type: data.propertyType,
          total_leasable_area_sqft: data.areaSqft,
          city: data.city || "Bengaluru",
          state: data.city && data.city.includes(",") ? data.city.split(",")[1].trim() : "Karnataka",
          country: "India",
        }),
      });

      if (propRes && propRes.ok) {
        const json = await propRes.json();
        if (json.data?.id && typeof window !== "undefined") {
          const regIds = JSON.parse(localStorage.getItem("officex_registered_property_ids") || "[]");
          if (!regIds.includes(json.data.id)) {
            regIds.push(json.data.id);
            localStorage.setItem("officex_registered_property_ids", JSON.stringify(regIds));
          }
          if (data.hasDelegatedManager && data.managerName) {
            const currentAssigns = JSON.parse(localStorage.getItem("officex_property_assignments") || "{}");
            currentAssigns[json.data.id] = {
              name: data.managerName,
              email: data.managerEmail || "",
              type: data.managerType || "pm_agency",
              assignedAt: new Date().toISOString(),
            };
            localStorage.setItem("officex_property_assignments", JSON.stringify(currentAssigns));
          }
        }
      }
    } catch (err) {
      console.error("Property persistence error:", err);
    }

    // Route to Complete Your Profile Hub
    router.push("/profile/complete");
  };

  const handleSkip = () => {
    router.push("/profile/complete");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl">
        <RentRollOnboardingWizard
          onComplete={handleOnboardingComplete}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">Loading Onboarding Suite...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
