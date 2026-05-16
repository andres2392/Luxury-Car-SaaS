import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <Card>
      <CardContent className="p-6 text-sm text-[var(--color-muted-foreground)]">
        {message}
      </CardContent>
    </Card>
  );
}
