"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { removeFavorite, saveFavorite } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function FavoriteButton({
  carId,
  isSaved,
  onChange,
  size = "sm",
}: {
  carId: number;
  isSaved: boolean;
  onChange?: (nextValue: boolean) => void;
  size?: "sm" | "default";
}) {
  const router = useRouter();
  const { isReady, user } = useAuthSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (!isReady) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSaved) {
        await removeFavorite(carId);
        onChange?.(false);
      } else {
        await saveFavorite(carId);
        onChange?.(true);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not update saved cars.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      type="button"
      variant={isSaved ? "default" : "secondary"}
      size={size}
      onClick={() => void handleClick()}
      disabled={isSubmitting}
      className={isSaved ? "" : "border-[var(--color-border)]"}
    >
      {isSubmitting ? "Saving..." : isSaved ? "Unsave" : "Save"}
    </Button>
  );
}
