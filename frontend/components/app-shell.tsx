"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { LoadingState } from "@/components/loading-state";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuthSession } from "@/hooks/use-auth-session";
import { isAdmin } from "@/lib/auth";

function isAuthRoute(pathname: string) {
  return pathname === "/login";
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
      router.replace("/dashboard");
    }
  }, [dashboardRoute, isReady, pathname, router, user]);

  if (!isReady && dashboardRoute) {
    return (
      <div className="min-h-screen bg-[#121310] text-white">
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
    return (
      <div className="min-h-screen bg-[#121310]">
        {children}
      </div>
    );
  }

  if (pathname === "/") {
    return (
      <div className="min-h-screen bg-[#050505]">
        <SiteHeader />
        <main>{children}</main>
      </div>
    );
  }

  if (isAuthRoute(pathname)) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <SiteHeader />
        <main>{children}</main>
      </div>
    );
  }

  if (pathname.startsWith("/cars/")) {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter variant="detail" />
      </div>
    );
  }

  if (pathname === "/cars") {
    return (
      <div className="min-h-screen bg-[#F4F1EA]">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter variant="light" />
      </div>
    );
  }

  if (pathname === "/inquiry") {
    return (
      <div className="min-h-screen bg-[#090909]">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter variant="inquiry" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">{children}</main>
      <SiteFooter variant={isAuthRoute(pathname) ? "dark" : "light"} />
    </div>
  );
}
