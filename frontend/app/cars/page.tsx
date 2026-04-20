import { CarsPageContent } from "@/components/cars-page-content";

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <CarsPageContent
      initialSearch={params.search ?? ""}
      initialBrand={params.brand ?? ""}
      initialMinPrice={params.min_price ?? ""}
      initialMaxPrice={params.max_price ?? ""}
    />
  );
}
