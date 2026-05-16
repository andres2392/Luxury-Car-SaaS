import * as React from "react";

import { cn } from "@/src/lib/cn";

type BadgeVariant = "default" | "champagne" | "muted" | "danger";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "border-border bg-card text-foreground",
  champagne: "border-collector-champagne/40 bg-collector-champagne/10 text-collector-champagne",
  muted: "border-white/10 bg-white/[0.03] text-muted-foreground",
  danger: "border-destructive/50 bg-destructive/12 text-[#F0C8BF]",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
