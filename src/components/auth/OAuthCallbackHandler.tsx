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

      // Redirection should ONLY occur if:
      // 1. This is a genuine OAuth callback landing (URL has access_token or authorization code)
      // 2. OR the user is on an explicit auth page (/login or /signup) and needs to be forwarded to their workspace.
      // Under NO CIRCUMSTANCES should visits to the root homepage ("/") or public pages be redirected!
      const currentHash = window.location.hash;
      const isOAuthHashLanding = hasInitialAuthHash || currentHash.includes("access_token=") || window.location.search.includes("code=");
      const isAuthPage = pathname === "/login" || pathname === "/signup";

      // If the user is on the homepage, NEVER redirect away! Clean up any stale redirect artifacts.
      if (pathname === "/") {
        if (!isOAuthHashLanding) {
          clearAuthCookie("officex_oauth_context");
          clearAuthCookie("officex_oauth_redirect");
          clearAuthCookie("officex_last_rent_roll");
          try {
            localStorage.removeItem("officex_oauth_context");
            localStorage.removeItem("officex_oauth_redirect");
            sessionStorage.removeItem("officex_oauth_context");
            sessionStorage.removeItem("officex_oauth_redirect");
          } catch {}
        }
        return;
      }

      // Only perform redirection if completing an OAuth callback or currently on login/signup
      if (isOAuthHashLanding || isAuthPage) {
        redirectedRef.current = true;

        // Clean up all OAuth redirection tokens so they never fire again
        clearAuthCookie("officex_oauth_context");
        clearAuthCookie("officex_oauth_redirect");
        clearAuthCookie("officex_last_rent_roll");
        try {
          localStorage.removeItem("officex_oauth_context");
          localStorage.removeItem("officex_oauth_redirect");
          sessionStorage.removeItem("officex_oauth_context");
          sessionStorage.removeItem("officex_oauth_redirect");
        } catch {}

        if (savedRedirect && !savedRedirect.startsWith("/login") && !savedRedirect.startsWith("/signup")) {
          if (savedRedirect !== pathname) {
            window.location.replace(savedRedirect);
          }
          return;
        }

        if (isRentRoll) {
          // Set Rent Roll context and role
          setAuthCookie("officex_user_role", "Property Owner & Asset Manager", 2592000);
          try {
            localStorage.setItem("officex_user_role", "Property Owner & Asset Manager");
            sessionStorage.setItem("officex_user_role", "Property Owner & Asset Manager");
          } catch {}

          const targetUrl = savedRedirect && savedRedirect.includes("rent-roll") ? savedRedirect : "/operate/rent-roll";
          window.location.replace(targetUrl);
          return;
        }

        // Default post-login destination if on login/signup
        if (isAuthPage) {
          const userRoleKey = localStorage.getItem("officex_role_key") || "owner";
          const defaultDash = userRoleKey === "property_manager" ? "/dashboard/pm" : "/dashboard/owner";
          window.location.replace(defaultDash);
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
