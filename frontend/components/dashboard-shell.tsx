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

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <ProtectedContent access="manage-cars">
      <div className="min-h-[calc(100vh-5rem)] py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-white/10 bg-[#090c12] p-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.38em] text-[#7f8ea3]">
                Luxury Control
              </p>
              <h2 className="mt-4 font-heading text-4xl tracking-[-0.04em] text-white">
                Dashboard
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#8ea0b9]">
                {user?.role === "admin"
                  ? "Manage inventory, inquiries, and future dealer operations."
                  : "Manage your dealership inventory and customer leads."}
              </p>
            </div>

            <nav className="space-y-2">
              {dashboardLinks.map((link) => {
                const isActive =
                  pathname === link.href || pathname.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-[#1d3fff] text-white shadow-[0_16px_40px_rgba(34,34,255,0.28)]"
                        : "text-[#9ab0c8] hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">Signed in as</p>
              <p className="mt-2 text-sm font-medium text-white">{user?.email}</p>
              <p className="mt-1 text-sm capitalize text-[#8ea0b9]">{user?.role}</p>
            </div>

            <Button
              variant="secondary"
              className="mt-6 w-full border-white/10 bg-white/6 text-white hover:bg-white/10"
              onClick={handleLogout}
            >
              Sign out
            </Button>
          </aside>

          <div className="rounded-[2rem] border border-[#d7dce5] bg-[linear-gradient(180deg,#11151d_0%,#0d1117_40%,#090c12_100%)] p-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.28)] md:p-8">
            {children}
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
}

