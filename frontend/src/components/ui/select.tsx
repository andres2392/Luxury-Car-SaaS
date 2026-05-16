import * as React from "react";

import { cn } from "@/src/lib/cn";

const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full border border-input bg-card px-4 text-sm text-foreground outline-none transition focus:border-ring",
        className
      )}
      {...props}
    />
  )
);
Select.displayName = "Select";

export { Select };
