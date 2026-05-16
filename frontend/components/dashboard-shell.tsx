"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { ProtectedContent } from "@/components/protected-content";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const dashboardLinks = [
  {
    href: "/dashboard",
    label: "Overview",
    isActive: (pathname: string) => pathname === "/dashboard",
  },
  {
    href: "/dashboard/cars",
    label: "Inventory",
    isActive: (pathname: string) =>
      pathname === "/dashboard/cars" ||
      (pathname.startsWith("/dashboard/cars/") && pathname !== "/dashboard/cars/new"),
  },
  {
    href: "/dashboard/inquiries",
    label: "Inquiries",
    isActive: (pathname: string) =>
      pathname === "/dashboard/inquiries" || pathname.startsWith("/dashboard/inquiries/"),
  },
  {
    href: "/dashboard/cars/new",
    label: "Upload",
    isActive: (pathname: string) => pathname === "/dashboard/cars/new",
  },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const accountName = user?.email?.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Dealer";
  const displayName = accountName.replace(/\b\w/g, (character) => character.toUpperCase());
  const navItemClass =
    "flex min-h-11 w-full items-center rounded-[0.2rem] border border-transparent px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.2em] transition sm:justify-center sm:text-center lg:justify-start lg:px-7 lg:text-left";

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <ProtectedContent access="manage-cars">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,168,120,0.08),transparent_24%),linear-gradient(180deg,#090909_0%,#10211B_26%,#183028_64%,#10211B_100%)]">
        <div className="grid min-h-screen bg-[linear-gradient(180deg,rgba(9,9,9,0.9)_0%,rgba(16,33,27,0.82)_48%,rgba(24,48,40,0.82)_100%)] lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="flex flex-col border-b border-white/6 bg-[linear-gradient(180deg,rgba(9,9,9,0.72)_0%,rgba(16,33,27,0.52)_100%)] text-[#f3efe7] backdrop-blur-sm lg:min-h-full lg:border-b-0 lg:border-r">
            <div className="px-5 py-4 sm:px-7 sm:py-6 lg:py-8">
              <Link href="/" aria-label="Trilogy Garage home" className="inline-flex">
                <BrandLogo
                  className="h-14 w-32 sm:h-16 sm:w-36 lg:h-20"
                  imageClassName="object-contain"
                />
              </Link>
            </div>

            <nav className="grid grid-cols-2 gap-2 px-4 pb-4 sm:grid-cols-4 sm:px-5 lg:grid-cols-1 lg:py-5">
              {dashboardLinks.map((link) => {
                const isActive = link.isActive(pathname);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      navItemClass,
                      isActive
                        ? "border-[#31463D] bg-white/[0.05] text-[#f3efe7]"
                        : "text-[#8E8A83] hover:text-[#f3efe7]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto" />
          </aside>

          <div className="overflow-x-hidden bg-[linear-gradient(180deg,rgba(9,9,9,0.04)_0%,rgba(16,33,27,0.08)_42%,rgba(24,48,40,0.12)_100%)] text-[#f3efe7]">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-end lg:px-4 lg:py-5">
              <div className="flex flex-wrap items-center justify-end gap-3 text-[#8E8A83] sm:gap-5">
                <div className="hidden pr-5 text-right lg:block">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E8A83]">
                    Last synced
                  </p>
                  <p className="mt-1 text-sm text-[#f3efe7]">2 minutes ago</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-white/8 bg-[#183028] text-sm font-semibold text-[#f3efe7]">
                    {user?.email?.[0]?.toUpperCase() ?? "D"}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-[#f3efe7]">{displayName}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[#8E8A83]">
                      {user?.role === "admin" ? "Global operations" : "Dealer operations"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="h-10 min-w-24 rounded-[0.2rem] border border-[#C2A878]/28 bg-transparent px-4 text-[#f3efe7] hover:bg-white/[0.04]"
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            </div>

            <div className="px-4 pb-10 pt-3 md:pb-12 lg:pt-4">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
}
