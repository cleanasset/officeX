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
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative overflow-hidden">
      {/* Soft Ambient Light Gradient Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-blue-100/50 via-slate-100/30 to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

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
