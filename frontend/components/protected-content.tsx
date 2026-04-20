"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { useAuthSession } from "@/hooks/use-auth-session";
import { canManageCars, isAdmin } from "@/lib/auth";
import type { User } from "@/lib/types";

type AccessMode = "authenticated" | "manage-cars" | "admin";

function hasAccess(mode: AccessMode, user: User | null) {
  if (mode === "authenticated") {
    return Boolean(user);
  }
  if (mode === "manage-cars") {
    return canManageCars(user);
  }
  return isAdmin(user);
}

export function ProtectedContent({
  access,
  children,
  redirectTo = "/login",
}: {
  access: AccessMode;
  children: React.ReactNode;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { isReady, user } = useAuthSession();

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.replace(redirectTo);
    }
  }, [isReady, router, user, redirectTo]);

  if (!isReady) {
    return <LoadingState message="Checking your access..." />;
  }

  if (!user) {
    return <LoadingState message="Redirecting to login..." />;
  }

  if (!hasAccess(access, user)) {
    return (
      <EmptyState
        title="Access restricted"
        description="Your account does not have permission for this section yet."
        actionLabel="Back to cars"
        actionHref="/cars"
      />
    );
  }

  return <>{children}</>;
}

