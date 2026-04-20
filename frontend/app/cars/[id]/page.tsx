import { CarDetailContent } from "@/components/car-detail-content";

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CarDetailContent carId={id} />;
}

