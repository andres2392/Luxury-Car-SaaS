import { DashboardCarForm } from "@/components/dashboard-car-form";
import { SectionHeading } from "@/components/section-heading";

export default function NewCarDashboardPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard / Cars"
        title="Create a new listing"
        description="This protected form uses the existing backend car endpoint and your stored JWT token."
        className="text-white"
      />
      <DashboardCarForm mode="create" />
    </div>
  );
}
