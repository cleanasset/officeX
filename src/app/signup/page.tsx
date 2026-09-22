import React, { Suspense } from "react";
import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Create your Account · OfficeX",
  description: "Register for your OfficeX workspace and access property management, leasing, and workplace tools.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface SignupPageProps {
  searchParams: Promise<{
    role?: string;
    intent?: string;
  }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Loading OfficeX Registration...
        </div>
      }
    >
      <SignupForm
        initialRole={params?.role}
        initialIntent={params?.intent}
      />
    </Suspense>
  );
}
