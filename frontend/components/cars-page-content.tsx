"use client";

import { useEffect, useMemo, useState } from "react";

import { CarCard } from "@/components/car-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listCars } from "@/lib/api";
import type { Car } from "@/lib/types";

export function CarsPageContent({ initialSearch = "" }: { initialSearch?: string }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [status, setStatus] = useState("Loading cars...");
  const searchTerm = initialSearch;

  async function loadCars() {
    setStatus("Loading cars...");
    try {
      const data = await listCars({
        brand,
        min_price: minPrice,
        max_price: maxPrice,
      });
      setCars(data);
      setStatus(data.length ? "" : "No cars matched your filters.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load cars.");
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

  return (
    <div className="space-y-8 py-10">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
          Inventory
        </p>
        <h1 className="font-heading text-5xl tracking-[-0.05em]">Luxury cars</h1>
        <p className="max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
          Browse the current marketplace, filter by brand and price, and create
          new listings when you are authenticated as a dealer or admin.
        </p>
      </div>

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
            onClick={() => void loadCars()}
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

      {status ? (
        <Card>
          <CardContent className="p-6 text-sm text-[var(--color-muted-foreground)]">
            {status}
          </CardContent>
        </Card>
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
