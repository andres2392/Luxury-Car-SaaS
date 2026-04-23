import { DashboardCarForm } from "@/components/dashboard-car-form";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";

export default async function EditCarDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading
          eyebrow="Dashboard / Cars"
          title="Edit listing"
          description="Update the car details and keep the inventory presentation current."
          className="text-white"
        />
        <Button
          type="submit"
          form="dashboard-car-form"
          className="h-11 rounded-2xl px-6"
        >
          Save changes
        </Button>
      </div>
      <DashboardCarForm mode="edit" carId={id} />
    </div>
  );
}
