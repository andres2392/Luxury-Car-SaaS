import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-5xl tracking-[-0.05em]">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
