"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { canManageCars, clearAuthSession } from "@/lib/auth";

export function SiteHeader() {
  const pathname = usePathname();
  const { isReady, user } = useAuthSession();
  const isHomePage = pathname === "/";
  const isInventoryPage = pathname === "/cars" || pathname === "/cars-detail";
  const isVehicleDetailPage = pathname.startsWith("/cars/");

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  if (isHomePage) {
    return (
      <header className="sticky top-0 z-30 border-b border-white/8 bg-transparent text-[#f3efe7] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold uppercase tracking-[0.38em] text-[#f3efe7]"
          >
            Luxury Auto
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/cars" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Inventory
            </Link>
            <Link href="#sell" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Sell Your Car
            </Link>
            <Link href="#experience" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Financing
            </Link>
            <Link href="#experience" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              About
            </Link>
          </nav>

          <div className="hidden w-28 lg:block" />
        </div>
      </header>
    );
  }

  if (isVehicleDetailPage) {
    return (
      <header className="sticky top-0 z-30 bg-[#FEFDFC] text-[#111111]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold uppercase tracking-[0.38em] text-[#111111]"
          >
            Luxury Auto
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/cars" className="px-3 py-2 text-sm text-[#555555] transition hover:text-[#111111]">
              Inventory
            </Link>
            <Link href="/#sell" className="px-3 py-2 text-sm text-[#555555] transition hover:text-[#111111]">
              Sell Your Car
            </Link>
            <Link href="/#experience" className="px-3 py-2 text-sm text-[#555555] transition hover:text-[#111111]">
              Financing
            </Link>
            <Link href="/#experience" className="px-3 py-2 text-sm text-[#555555] transition hover:text-[#111111]">
              About
            </Link>
          </nav>

          <div className="hidden w-32 sm:block" />
        </div>
      </header>
    );
  }

  if (isInventoryPage) {
    return (
      <header className="sticky top-0 z-20 bg-[#FEFDFC]/96 text-[#111111] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1580px] items-center justify-between gap-6 px-6 py-5 sm:px-10 lg:px-12">
          <nav className="hidden items-center gap-8 lg:flex">
            <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#111111] transition hover:text-[#3d4c45]">
              Certified Program Overview
            </Link>
            <Link href="/" className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#111111] transition hover:text-[#3d4c45]">
              Locate Dealer
            </Link>
          </nav>

          <Link href="/" className="shrink-0 text-center text-xs font-semibold uppercase tracking-[0.45em] text-[#111111]">
            Luxury Auto
          </Link>

          <div className="flex items-center gap-3">
            {isReady && user ? (
              <>
                {canManageCars(user) ? (
                  <Link href="/dashboard" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#111111] transition hover:text-[#3d4c45]">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/account" className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#111111] transition hover:text-[#3d4c45]">
                    Account
                  </Link>
                )}
                <Button variant="secondary" onClick={handleLogout} className="border-[#DDD7CC] bg-[#F5F2EC] text-[#111111] hover:bg-white">
                  Sign out
                </Button>
              </>
            ) : (
              <div className="h-10 w-6" />
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#cbb78a]/14 bg-[#010101]/90 text-[#f3efe7] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.45em] text-[#f3efe7]">
          Luxury-Car-SaaS
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/cars" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
            Cars
          </Link>

          {isReady && canManageCars(user) ? (
            <Link href="/dashboard" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Dashboard
            </Link>
          ) : null}

          {isReady && user && !canManageCars(user) ? (
            <Link href="/account" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Account
            </Link>
          ) : null}

          {isReady && user ? (
            <>
              <Button variant="secondary" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <div className="h-10 w-6" />
          )}
        </nav>
      </div>
    </header>
  );
}
