import { CarsPageContent } from "@/components/cars-page-content";

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;

  return <CarsPageContent initialSearch={params.search ?? ""} />;
}
