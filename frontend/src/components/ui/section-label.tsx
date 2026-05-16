import * as React from "react";

import { cn } from "@/src/lib/cn";

export function SectionLabel({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.24em] text-collector-champagne/80",
        className
      )}
      {...props}
    />
  );
}
