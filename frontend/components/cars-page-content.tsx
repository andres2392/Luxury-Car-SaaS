"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CarCard } from "@/components/car-card";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCars } from "@/lib/api";
import type { Car } from "@/lib/types";

export function CarsPageContent({
  initialSearch = "",
  initialBrand = "",
  initialMinPrice = "",
  initialMaxPrice = "",
}: {
  initialSearch?: string;
  initialBrand?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
}) {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);
  const [brand, setBrand] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const searchTerm = initialSearch;

  async function loadCars(nextFilters?: { brand: string; minPrice: string; maxPrice: string }) {
    const filters = nextFilters ?? { brand, minPrice, maxPrice };
    setIsLoading(true);
    try {
      const data = await getCars({
        brand: filters.brand,
        min_price: filters.minPrice,
        max_price: filters.maxPrice,
      });
      setCars(data);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load cars.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCars();
  }, []);

  const filteredCars = useMemo(() => {
    if (!searchTerm.trim()) {
      return cars;
    }

    const normalized = searchTerm.toLowerCase();
    return cars.filter((car) =>
      [car.title, car.brand, car.model].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [cars, searchTerm]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (brand.trim()) {
      params.set("brand", brand.trim());
    }
    if (minPrice.trim()) {
      params.set("min_price", minPrice.trim());
    }
    if (maxPrice.trim()) {
      params.set("max_price", maxPrice.trim());
    }

    router.replace(`/cars${params.toString() ? `?${params.toString()}` : ""}`);
    void loadCars({ brand, minPrice, maxPrice });
  };

  return (
    <div className="space-y-8 py-10">
      <SectionHeading
        eyebrow="Inventory"
        title="Luxury cars"
        description="Browse the current marketplace, filter by brand and price, and explore a more connected premium catalog experience."
      />

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <Input placeholder="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <Input placeholder="Min price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <Input placeholder="Max price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 rounded-full bg-[var(--color-foreground)] px-5 text-sm font-medium text-white"
          >
            Apply
          </button>
        </CardContent>
      </Card>

      {searchTerm ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Showing results for <span className="font-medium text-[var(--color-foreground)]">{searchTerm}</span>.
        </p>
      ) : null}

      {isLoading ? (
        <LoadingState message="Loading cars..." />
      ) : status ? (
        <Card>
          <CardContent className="p-6 text-sm text-[var(--color-muted-foreground)]">
            {status}
          </CardContent>
        </Card>
      ) : filteredCars.length === 0 ? (
        <EmptyState
          title="No matching cars"
          description="Try widening the price range or changing the brand search to explore more inventory."
          actionLabel="Reset filters"
          actionHref="/cars"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {filteredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
