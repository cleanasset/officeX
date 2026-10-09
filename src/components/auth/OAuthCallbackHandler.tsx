"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setAuthCookie, getAuthCookie, clearAuthCookie } from "@/lib/auth-storage";

export default function OAuthCallbackHandler() {
  const pathname = usePathname();
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Immediately record if arriving with OAuth hash before Supabase client strips it
    const hasInitialAuthHash =
      window.location.hash.includes("access_token=") ||
      window.location.hash.includes("refresh_token=") ||
      window.location.search.includes("code=");

    const handleOAuthRedirect = (sessionUser: any) => {
      if (!sessionUser || redirectedRef.current) return;

      const email = (sessionUser.email || "").toLowerCase().trim();
      const fullName =
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        "";
      const phone = sessionUser.phone || "";

      // 1. Persist authenticated session everywhere
      setAuthCookie("officex_session_active", "1");
      setAuthCookie("officex_auth", "1");
      localStorage.setItem("officex_session_active", "1");
      localStorage.setItem("officex_auth", "1");
      sessionStorage.setItem("officex_session_active", "1");

      if (email) {
        setAuthCookie("officex_user_email", email);
        localStorage.setItem("officex_user_email", email);
        sessionStorage.setItem("officex_user_email", email);
      }
      if (fullName) {
        setAuthCookie("officex_user_name", fullName);
        localStorage.setItem("officex_user_name", fullName);
        sessionStorage.setItem("officex_user_name", fullName);
      }
      if (phone) {
        setAuthCookie("officex_user_mobile", phone);
        localStorage.setItem("officex_user_mobile", phone);
        sessionStorage.setItem("officex_user_mobile", phone);
      }

      // Notify all components on page (e.g. HeaderAuthButton)
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("officex_auth_change", { detail: { user: sessionUser } }));

      // 2. Resolve OAuth Intent / Context
      const cookieCtx = getAuthCookie("officex_oauth_context");
      const localCtx = localStorage.getItem("officex_oauth_context") || "";
      const sessionCtx = sessionStorage.getItem("officex_oauth_context") || "";
      const lastRentRoll = getAuthCookie("officex_last_rent_roll");

      const savedContext = cookieCtx || localCtx || sessionCtx;

      const cookieRedirect = getAuthCookie("officex_oauth_redirect");
      const localRedirect = localStorage.getItem("officex_oauth_redirect") || "";
      const sessionRedirect = sessionStorage.getItem("officex_oauth_redirect") || "";
      const savedRedirect = cookieRedirect || localRedirect || sessionRedirect;

      const referrerHasRentRoll = document.referrer ? document.referrer.toLowerCase().includes("rent-roll") : false;

      const isRentRoll =
        savedContext === "rent-roll" ||
        savedRedirect.includes("rent-roll") ||
        lastRentRoll === "1" ||
        referrerHasRentRoll;

      // Check if current URL represents an OAuth callback landing
      const currentHash = window.location.hash;
      const isOAuthHashLanding = hasInitialAuthHash || currentHash.includes("access_token=") || currentHash === "#";
      const isLandingPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

      // If user came via OAuth or landed on root/login
      if (isOAuthHashLanding || isLandingPage) {
        if (isRentRoll) {
          redirectedRef.current = true;

          // Consume intent
          clearAuthCookie("officex_oauth_context");
          clearAuthCookie("officex_last_rent_roll");
          localStorage.removeItem("officex_oauth_context");
          sessionStorage.removeItem("officex_oauth_context");

          // Set Rent Roll context and role
          setAuthCookie("officex_user_role", "Property Owner & Asset Manager", 2592000);
          localStorage.setItem("officex_user_role", "Property Owner & Asset Manager");
          sessionStorage.setItem("officex_user_role", "Property Owner & Asset Manager");

          // Direct redirect into Rent Roll Dashboard
          const targetUrl = savedRedirect && savedRedirect.includes("rent-roll") ? savedRedirect : "/properties/rent-roll?tab=dashboard";
          window.location.replace(targetUrl);
          return;
        }

        if (savedRedirect && savedRedirect !== "/" && savedRedirect !== pathname) {
          redirectedRef.current = true;
          clearAuthCookie("officex_oauth_context");
          clearAuthCookie("officex_oauth_redirect");
          localStorage.removeItem("officex_oauth_context");
          localStorage.removeItem("officex_oauth_redirect");
          sessionStorage.removeItem("officex_oauth_context");
          sessionStorage.removeItem("officex_oauth_redirect");
          window.location.replace(savedRedirect);
          return;
        }

        // If on login/signup page and authenticated, send to properties rent-roll
        if (isLandingPage && isOAuthHashLanding) {
          redirectedRef.current = true;
          window.location.replace("/properties/rent-roll?tab=dashboard");
          return;
        }
      }
    };

    // Check existing Supabase session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        handleOAuthRedirect(session.user);
      }
    }).catch(() => {});

    // Listen for auth state transitions (e.g. OAuth callback completion)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        handleOAuthRedirect(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname]);

  return null;
}
