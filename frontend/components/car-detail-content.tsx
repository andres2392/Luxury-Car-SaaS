"use client";

import { useEffect, useMemo, useState } from "react";

import { InquiryForm } from "@/components/inquiry-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCar } from "@/lib/api";
import type { Car } from "@/lib/types";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function CarDetailContent({ carId }: { carId: string }) {
  const [car, setCar] = useState<Car | null>(null);
  const [status, setStatus] = useState("Loading car details...");

  useEffect(() => {
    async function loadCar() {
      try {
        const data = await getCar(carId);
        setCar(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load car.");
      }
    }

    void loadCar();
  }, [carId]);

  const gallery = useMemo(() => {
    if (!car) {
      return [];
    }

    const images = [car.main_image_url, ...car.image_urls].filter(Boolean);
    return [...new Set(images)] as string[];
  }, [car]);

  if (!car) {
    return (
      <Card className="mt-10">
        <CardContent className="p-6 text-sm text-[var(--color-muted-foreground)]">
          {status}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 py-10">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)]">
            <div className="aspect-[16/10] bg-[linear-gradient(135deg,#f6ede0_0%,#eadcc5_100%)]">
              {gallery[0] ? (
                <img src={gallery[0]} alt={car.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {gallery.slice(1).map((image) => (
              <div key={image} className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)]">
                <div className="aspect-[4/3]">
                  <img src={image} alt={car.title} className="h-full w-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
              {car.brand} {car.model}
            </p>
            <h1 className="mt-3 font-heading text-5xl tracking-[-0.05em]">{car.title}</h1>
            <p className="mt-4 text-3xl font-semibold text-[var(--color-accent)]">
              {formatPrice(car.price)}
            </p>
          </div>

          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                  Year
                </p>
                <p className="mt-2 text-lg font-medium">{car.year}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                  Mileage
                </p>
                <p className="mt-2 text-lg font-medium">{car.mileage.toLocaleString()} miles</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
                  Dealer
                </p>
                <p className="mt-2 text-lg font-medium">{car.dealer.name}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-8 text-[var(--color-muted-foreground)]">
                {car.description ?? "No description available for this vehicle yet."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send inquiry</CardTitle>
              <CardDescription>
                Guests and logged-in users can both contact the dealer from here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InquiryForm carId={car.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

