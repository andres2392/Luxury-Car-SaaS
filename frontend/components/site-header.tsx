"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearAuthSession, isAdmin } from "@/lib/auth";

export function SiteHeader() {
  const { isReady, user } = useAuthSession();

  const handleLogout = () => {
    clearAuthSession();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[rgba(246,242,234,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.45em] text-[var(--color-muted-foreground)]">
          Luxury-Car-SaaS
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/cars" className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]">
            Cars
          </Link>

          {isReady && isAdmin(user) ? (
            <Link href="/dashboard" className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]">
              Dashboard
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
