import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { ProtectedContent } from "@/components/protected-content";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <ProtectedContent access="admin">
      <div className="space-y-8 py-10">
        <SectionHeading
          eyebrow="Dashboard"
          title="Admin entry point"
          description="This lightweight dashboard is the protected starting point for future admin and dealer management flows."
        />

        <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-white/80 p-8 shadow-[0_24px_60px_rgba(64,45,26,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-3xl tracking-[-0.03em]">Create new car listings</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">
                Continue into the protected listing form. Dealer creation can plug into this dashboard in a later phase.
              </p>
            </div>
            <Link href="/dashboard/cars/new">
              <Button>Create car</Button>
            </Link>
          </div>
        </div>

        <EmptyState
          title="Dealer management comes next"
          description="The dashboard stays intentionally light in Phase 5. The admin-only dealer creation workflow can be added here in the next step."
        />
      </div>
    </ProtectedContent>
  );
}

