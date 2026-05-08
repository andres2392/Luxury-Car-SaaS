"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ProtectedContent } from "@/components/protected-content";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearAuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/favorites", label: "Saved Cars" },
  { href: "/account/inquiries", label: "My Inquiries" },
];

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuthSession();

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <ProtectedContent access="authenticated">
      <div className="min-h-[calc(100vh-5rem)] py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-white/10 bg-[#0b0f16] p-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.4)]">
            <p className="text-xs uppercase tracking-[0.34em] text-[#7f8ea3]">My Account</p>
            <h2 className="mt-4 font-heading text-4xl tracking-[-0.04em] text-white">
              Concierge
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#8ea0b9]">
              Save favorite cars, revisit your inquiries, and keep your luxury shortlist in one place.
            </p>

            <nav className="mt-8 space-y-2">
              {accountLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-white text-[#111827]"
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

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,#121822_0%,#0b0f16_100%)] p-6 text-white shadow-[0_30px_90px_rgba(2,6,23,0.28)] md:p-8">
            {children}
          </div>
        </div>
      </div>
    </ProtectedContent>
  );
}
