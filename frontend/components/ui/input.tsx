import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-11 w-full rounded-full border border-[var(--color-border)] bg-white/85 px-4 py-2 text-sm text-[var(--color-foreground)] shadow-sm outline-none transition placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(185,145,82,0.16)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
