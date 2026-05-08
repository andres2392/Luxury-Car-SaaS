"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ProtectedContent } from "@/components/protected-content";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/cars", label: "Cars" },
  { href: "/dashboard/inquiries", label: "Inquiries" },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthSession();
  const accountName = user?.email?.split("@")[0]?.replace(/[._-]+/g, " ") ?? "Dealer";
  const displayName = accountName.replace(/\b\w/g, (character) => character.toUpperCase());

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <ProtectedContent access="manage-cars">
      <div className="min-h-screen bg-[#121310]">
        <div className="grid min-h-screen bg-[#171816] lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="flex min-h-full flex-col bg-[#171816] text-[#f1eadf]">
            <div className="px-6 py-7">
              <p className="font-heading text-[1.7rem] leading-[1.05] tracking-[0.08em] text-[#f1eadf]">
                PRESTIGE
              </p>
              <p className="mt-1 font-heading text-[1.7rem] leading-[1.05] tracking-[0.08em] text-[#f1eadf]">
                MOTORS
              </p>
            </div>

            <nav className="space-y-1.5 px-4 py-5">
              {dashboardLinks.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-[0.35rem] border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
                      isActive
                        ? "border-[#343830] bg-[#1e201d] text-[#f1eadf]"
                        : "text-[#9da397] hover:border-[#292b27] hover:bg-[#1b1d1a] hover:text-[#f1eadf]"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto px-4 py-5">
              <div className="bg-[#1b1c19] px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f968c]">Signed in as</p>
                <p className="mt-2 text-sm font-medium text-[#f1eadf]">{displayName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#a7ab9f]">
                  {user?.role} operations
                </p>
              </div>

              <Button
                variant="secondary"
                className="mt-4 h-10 w-full rounded-[0.35rem] border border-[#3d4038] bg-transparent text-[#f1eadf] hover:bg-[#1b1d1a]"
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </div>
          </aside>

          <div className="bg-[linear-gradient(180deg,#171816_0%,#1b1c19_52%,#1f221e_100%)] text-[#f1eadf]">
            <div className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="flex h-11 w-full max-w-xl items-center bg-[#1b1c19] px-4 text-sm text-[#8f968c]">
                Search vehicles, clients, dealers...
              </div>

              <div className="flex items-center gap-5 text-[#a7ab9f]">
                <div className="hidden pr-5 text-right lg:block">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f968c]">Last synced</p>
                  <p className="mt-1 text-sm text-[#f1eadf]">2 minutes ago</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center border border-[#394036] bg-[#26352F] text-sm font-semibold text-[#f1eadf]">
                    {user?.email?.[0]?.toUpperCase() ?? "D"}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-[#f1eadf]">{displayName}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[#f1eadf]">
                      {user?.role === "admin" ? "Global operations" : "Dealer operations"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">{children}</div>
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
}
