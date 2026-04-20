import { DashboardCarForm } from "@/components/dashboard-car-form";
import { SectionHeading } from "@/components/section-heading";

export default async function EditCarDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard / Cars"
        title="Edit listing"
        description="Update the car details and keep the inventory presentation current."
        className="text-white"
      />
      <DashboardCarForm mode="edit" carId={id} />
    </div>
  );
}
