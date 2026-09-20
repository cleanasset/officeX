import React, { Suspense } from "react";
import SignupForm from "./SignupForm";

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
