"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CarCard } from "@/components/car-card";
import { LoadingState } from "@/components/loading-state";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCars } from "@/lib/api";
import type { Car } from "@/lib/types";

export function HomePageContent() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFeaturedCars() {
      setIsLoading(true);
      try {
        const data = await getCars();
        setCars(data.slice(0, 3));
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load featured cars.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadFeaturedCars();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("search", query.trim());
    }
    router.push(`/cars${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="space-y-16 py-10">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
            Premium dealer marketplace
          </div>
          <h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Discover luxury inventory with a polished digital showroom.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
            Explore a premium catalog of luxury vehicles, elegant dealer profiles,
            and a simple inquiry experience built on the new API foundation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by brand or model"
              className="h-12 rounded-full"
            />
            <Button size="lg" onClick={handleSearch}>
              Search inventory
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-none bg-[linear-gradient(135deg,#fffdf8_0%,#f3e7d1_46%,#ead8b5_100%)]">
          <CardContent className="space-y-8 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                Featured experience
              </p>
              <h2 className="mt-3 font-heading text-4xl tracking-[-0.04em]">
                Boutique presentation, modern workflow.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="font-heading text-3xl">5</p>
                <p className="text-sm uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  luxury cars
                </p>
              </div>
              <div>
                <p className="font-heading text-3xl">2</p>
                <p className="text-sm uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  premium dealers
                </p>
              </div>
              <div>
                <p className="font-heading text-3xl">JWT</p>
                <p className="text-sm uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  auth ready
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Featured Cars"
            title="A curated first impression"
            className="space-y-2"
          />
          <Button variant="secondary" onClick={() => router.push("/cars")}>
            View all cars
          </Button>
        </div>

        {isLoading ? (
          <LoadingState message="Loading featured cars..." />
        ) : error ? (
          <Card>
            <CardContent className="p-6 text-sm text-[var(--color-muted-foreground)]">
              {error}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
