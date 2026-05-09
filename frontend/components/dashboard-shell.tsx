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
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/cars", label: "Inventory" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const accountName = user?.email?.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Dealer";
  const displayName = accountName.replace(/\b\w/g, (character) => character.toUpperCase());
  const navItemClass =
    "block rounded-[0.2rem] border border-transparent px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition";

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <ProtectedContent access="manage-cars">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(194,168,120,0.08),transparent_24%),linear-gradient(180deg,#090909_0%,#10211B_26%,#183028_64%,#10211B_100%)]">
        <div className="grid min-h-screen bg-[linear-gradient(180deg,rgba(9,9,9,0.9)_0%,rgba(16,33,27,0.82)_48%,rgba(24,48,40,0.82)_100%)] lg:grid-cols-[236px_minmax(0,1fr)]">
          <aside className="flex min-h-full flex-col border-r border-white/6 bg-[linear-gradient(180deg,rgba(9,9,9,0.72)_0%,rgba(16,33,27,0.52)_100%)] text-[#f3efe7] backdrop-blur-sm">
            <div className="px-7 py-8">
              <Link href="/" aria-label="Trilogy Garage home" className="inline-flex">
                <BrandLogo className="h-20 w-36" imageClassName="object-contain" />
              </Link>
            </div>

            <nav className="space-y-2 px-5 py-5">
              {dashboardLinks.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);

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

              <Link
                href="/dashboard/cars/new"
                className={cn(navItemClass, "mt-5 text-[#8E8A83] hover:text-[#f3efe7]")}
              >
                Upload
              </Link>
            </nav>

            <div className="mt-auto px-5 py-6">
              <div className="border border-white/6 bg-white/[0.03] px-4 py-4 backdrop-blur-sm">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8E8A83]">Signed in as</p>
                <p className="mt-2 text-sm font-medium text-[#f3efe7]">{displayName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#8E8A83]">
                  {user?.role} operations
                </p>
              </div>

              <Button
                variant="secondary"
                className="mt-4 h-10 w-full rounded-[0.2rem] border border-[#C2A878]/28 bg-transparent text-[#f3efe7] hover:bg-white/[0.04]"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </aside>

          <div className="bg-[linear-gradient(180deg,rgba(9,9,9,0.04)_0%,rgba(16,33,27,0.08)_42%,rgba(24,48,40,0.12)_100%)] text-[#f3efe7]">
            <div className="flex justify-end px-8 py-5 lg:px-14 xl:px-20">
              <div className="flex items-center gap-5 text-[#8E8A83]">
                <div className="hidden pr-5 text-right lg:block">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E8A83]">Last synced</p>
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
              </div>
            </div>

            <div className="px-8 pb-10 pt-4 md:pb-12 lg:px-14 xl:px-20">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
}
