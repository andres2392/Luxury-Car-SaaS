"use client";

import { useEffect, useState } from "react";

import { getStoredUser, isLoggedIn } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useAuthSession() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const syncAuth = () => {
      setUser(getStoredUser());
      setIsReady(true);
    };

    syncAuth();

    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    window.addEventListener("auth-change", syncAuth as EventListener);

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener("auth-change", syncAuth as EventListener);
    };
  }, []);

  return {
    isReady,
    isLoggedIn: isLoggedIn(),
    user,
  };
}

