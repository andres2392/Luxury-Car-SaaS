import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div>
          <h3 className="font-heading text-3xl tracking-[-0.03em]">{title}</h3>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">
            {description}
          </p>
        </div>
        {actionLabel && actionHref ? (
          <Link href={actionHref}>
            <Button variant="secondary">{actionLabel}</Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

