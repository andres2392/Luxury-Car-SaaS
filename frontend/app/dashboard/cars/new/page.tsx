import { DashboardCarForm } from "@/components/dashboard-car-form";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export default function NewCarDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading
          eyebrow="Dashboard / Cars"
          title="Create a new listing"
          description="This protected form uses the existing backend car endpoint and your stored JWT token."
          className="text-white"
        />
        <Button
          type="submit"
          form="dashboard-car-form"
          className="h-11 rounded-2xl px-6"
        >
          Create car
        </Button>
      </div>
      <DashboardCarForm mode="create" />
    </div>
  );
}
