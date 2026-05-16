import * as React from "react";

import { cn } from "@/src/lib/cn";

export function FormCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border border-white/8 bg-dashboard-surface p-5 md:p-6", className)}
      {...props}
    />
  );
}
