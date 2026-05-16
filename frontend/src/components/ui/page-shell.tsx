import * as React from "react";

import { cn } from "@/src/lib/cn";

export function PageShell({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-screen bg-background text-foreground", className)} {...props} />;
}

export function PageSection({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <section className={cn("px-6 py-12 sm:px-10 lg:px-12 xl:px-20", className)} {...props} />;
}
