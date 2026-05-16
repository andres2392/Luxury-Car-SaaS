import * as React from "react";

import { cn } from "@/src/lib/cn";

export function PublicSection({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("px-6 py-12 sm:px-10 md:py-16 lg:px-12 xl:px-20", className)}
      {...props}
    />
  );
}
