import { DashboardNewCarContent } from "@/components/dashboard-new-car-content";
import { ProtectedContent } from "@/components/protected-content";
import { SectionHeading } from "@/components/section-heading";

export default function NewCarDashboardPage() {
  return (
    <ProtectedContent access="admin">
      <div className="space-y-8 py-10">
        <SectionHeading
          eyebrow="Dashboard / Cars"
          title="Create a new listing"
          description="This protected form uses the existing backend car endpoint and your stored JWT token."
        />
        <DashboardNewCarContent />
      </div>
    </ProtectedContent>
  );
}
