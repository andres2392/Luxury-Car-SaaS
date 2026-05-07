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

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  if (isHomePage) {
    return (
      <header className="sticky top-0 z-30 border-b border-[#cbb78a]/14 bg-[#010101]/90 text-[#f3efe7] backdrop-blur-xl">
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
          ) : isReady ? (
            <>
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          ) : (
            <div className="h-10 w-24" />
          )}
        </nav>
      </div>
    </header>
  );
}
