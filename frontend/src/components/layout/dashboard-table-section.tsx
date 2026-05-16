import * as React from "react";

import { cn } from "@/src/lib/cn";

export function DashboardTableSection({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("overflow-hidden border border-white/7 bg-dashboard-surface/70", className)}
      {...props}
    />
  );
}
