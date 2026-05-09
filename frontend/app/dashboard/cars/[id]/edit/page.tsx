import { DashboardCarForm } from "@/components/dashboard-car-form";

export default async function EditCarDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <DashboardCarForm mode="edit" carId={id} />
    </div>
  );
}
