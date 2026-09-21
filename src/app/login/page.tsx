import React from "react";
import SignInForm from "./SignInForm";
import { validateRedirect } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{
    redirect?: string;
    role?: string;
    intent?: string;
    context?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const safeRedirect = validateRedirect(params?.redirect, "/properties");

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
      {/* Main Container */}
      <div className="w-full relative z-10 flex justify-center items-center">
        <SignInForm
          initialRedirect={safeRedirect}
          initialRole={params?.role}
          initialContext={params?.context}
        />
      </div>
    </main>
  );
}
