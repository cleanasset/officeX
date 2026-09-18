import React from "react";
import SignInForm from "./SignInForm";
import { validateRedirect } from "@/lib/auth-utils";

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
    <main className="min-h-screen bg-[#081325] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Gradient Shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-900/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full relative z-10">
        <SignInForm
          initialRedirect={safeRedirect}
          initialRole={params?.role}
          initialContext={params?.context}
        />
      </div>
    </main>
  );
}
