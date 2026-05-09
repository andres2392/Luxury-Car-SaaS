"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { canManageCars, clearAuthSession } from "@/lib/auth";

export function SiteHeader() {
  const pathname = usePathname();
  const { isReady, user } = useAuthSession();
  const isHomePage = pathname === "/";
  const isInventoryPage = pathname === "/cars";
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
            aria-label="Trilogy Garage home"
            className="shrink-0"
          >
            <BrandLogo className="h-12 w-40" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Link href="/cars" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Inventory
            </Link>
            <Link href="#experience" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              About
            </Link>
            <Link href="/inquiry" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Inquiry
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
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-4 sm:px-10 lg:px-12">
          <div aria-hidden="true" />

          <Link
            href="/"
            aria-label="Trilogy Garage home"
            className="justify-self-center"
          >
            <BrandLogo className="h-12 w-40" />
          </Link>

          <Link
            href="/inquiry"
            className="justify-self-end border border-[#DDD7CC] bg-[#FEFDFC] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111111] transition hover:border-[#3D4C45] hover:bg-[#F5F2EC]"
          >
            Make Inquiry
          </Link>
        </div>
      </header>
    );
  }

  if (isInventoryPage) {
    const headerClass = "sticky top-0 z-20 bg-[#FEFDFC] text-[#111111]";

    return (
      <header className={headerClass}>
        <div className="mx-auto grid max-w-[1580px] grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-5 sm:px-10 lg:px-12">
          <div aria-hidden="true" />

          <Link href="/" aria-label="Trilogy Garage home" className="justify-self-center">
            <BrandLogo className="h-12 w-40" />
          </Link>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/inquiry"
              className="border border-[#DDD7CC] bg-[#FEFDFC] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#111111] transition hover:border-[#3D4C45] hover:bg-[#F5F2EC]"
            >
              Make Inquiry
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[#cbb78a]/14 bg-[#010101]/90 text-[#f3efe7] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" aria-label="Trilogy Garage home" className="shrink-0">
          <BrandLogo className="h-12 w-40" />
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/cars" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
            Cars
          </Link>
          <Link href="/inquiry" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
            Inquiry
          </Link>

          {isReady && canManageCars(user) ? (
            <Link href="/dashboard" className="px-3 py-2 text-sm text-[#f3efe7] transition hover:text-white">
              Dashboard
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
