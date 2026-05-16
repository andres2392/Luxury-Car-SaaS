import * as React from "react";

import { cn } from "@/src/lib/cn";

export function DashboardPageShell({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pr-6 text-foreground lg:pr-10 xl:pr-14", className)} {...props} />;
}

export function DashboardPanel({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("border border-white/7 bg-dashboard-surface/70", className)}
      {...props}
    />
  );
}
