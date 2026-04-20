import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import type { Car } from "@/lib/types";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function CarCard({ car }: { car: Car }) {
  return (
    <Link href={`/cars/${car.id}`} className="block transition-transform duration-300 hover:-translate-y-1">
      <Card className="overflow-hidden">
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
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-2xl tracking-[-0.03em]">{car.title}</p>
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

          <div className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
            {car.dealer.name}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

