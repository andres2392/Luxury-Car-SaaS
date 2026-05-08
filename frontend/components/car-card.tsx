import Link from "next/link";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import type { Car } from "@/lib/types";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function CarCard({
  car,
  action,
}: {
  car: Car;
  action?: ReactNode;
}) {
  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:-translate-y-1">
      <Link href={`/cars/${car.id}`} className="block">
        <div className="aspect-[16/10] w-full bg-[linear-gradient(135deg,#f6ede0_0%,#eadcc5_100%)]">
          {car.main_image_url ? (
            <img
              src={car.main_image_url}
              alt={car.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
              Luxury Vehicle
            </div>
          )}
        </div>
      </Link>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href={`/cars/${car.id}`}>
              <p className="font-heading text-2xl tracking-[-0.03em]">{car.title}</p>
            </Link>
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {car.brand} {car.model} • {car.year}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-[var(--color-accent)]">
              {formatPrice(car.price)}
            </p>
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
              {car.mileage.toLocaleString()} miles
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
            {car.dealer.name}
          </div>
          {action}
        </div>
      </CardContent>
    </Card>
  );
}
