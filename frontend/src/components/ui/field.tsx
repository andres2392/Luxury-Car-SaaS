import * as React from "react";

import { cn } from "@/src/lib/cn";

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2 text-sm text-muted-foreground", className)}>
      <span>{label}</span>
      {children}
      {error ? <span className="block text-xs text-[#F0C8BF]">{error}</span> : null}
    </label>
  );
}
