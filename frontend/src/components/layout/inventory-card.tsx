import * as React from "react";

import { cn } from "@/src/lib/cn";

export function InventoryCard({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <article
      className={cn("overflow-hidden border border-[var(--light-border)] bg-white", className)}
      {...props}
    />
  );
}
