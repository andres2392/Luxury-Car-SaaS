"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { LoadingState } from "@/components/loading-state";
import { SiteHeader } from "@/components/site-header";
import { useAuthSession } from "@/hooks/use-auth-session";
import { canManageCars, isAdmin } from "@/lib/auth";

function isAuthRoute(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isReady, user } = useAuthSession();

  const dashboardRoute = pathname.startsWith("/dashboard");
  const adminOutsideDashboard = isReady && isAdmin(user) && !dashboardRoute;
  const loggedInOnAuthPage = isReady && user && isAuthRoute(pathname);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (isAdmin(user) && !dashboardRoute) {
      router.replace("/dashboard");
      return;
    }

    if (user && isAuthRoute(pathname)) {
      router.replace(canManageCars(user) ? "/dashboard" : "/cars");
    }
  }, [dashboardRoute, isReady, pathname, router, user]);

  if (!isReady && dashboardRoute) {
    return (
      <div className="min-h-screen bg-[#05070b] px-6 py-10 text-white sm:px-10 lg:px-12">
        <LoadingState message="Opening dashboard..." />
      </div>
    );
  }

  if (adminOutsideDashboard || loggedInOnAuthPage) {
    return (
      <div className="min-h-screen bg-[#05070b] px-6 py-10 text-white sm:px-10 lg:px-12">
        <LoadingState message="Redirecting..." />
      </div>
    );
  }

  if (dashboardRoute) {
    return <div className="min-h-screen bg-[#05070b] px-6 py-8 sm:px-8 lg:px-10">{children}</div>;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">{children}</main>
    </>
  );
}
