"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { getMyCars } from "@/lib/api";
import type { Car } from "@/lib/types";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function DashboardCarsContent() {
  const [cars, setCars] = useState<Car[]>([]);
  const [status, setStatus] = useState("Loading cars...");
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");

  async function loadCars() {
    try {
      const data = await getMyCars();
      setCars(data);
      setStatus("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load cars.");
    }
  }

  useEffect(() => {
    void loadCars();
  }, []);

  const availableBrands = useMemo(
    () =>
      [...new Set(cars.map((car) => car.brand))]
        .sort((a, b) => a.localeCompare(b)),
    [cars]
  );

  const availableYears = useMemo(
    () =>
      [...new Set(cars.map((car) => car.year))]
        .sort((a, b) => b - a),
    [cars]
  );

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const matchesBrand =
        brandFilter.length === 0 || brandFilter.includes(car.brand);
      const matchesYear = !yearFilter || String(car.year) === yearFilter;
      const numericPrice = Number(car.price);
      const matchesMin = !minPriceFilter || numericPrice >= Number(minPriceFilter);
      const matchesMax = !maxPriceFilter || numericPrice <= Number(maxPriceFilter);

      return matchesBrand && matchesYear && matchesMin && matchesMax;
    });
  }, [brandFilter, cars, maxPriceFilter, minPriceFilter, yearFilter]);

  if (status) {
    return <LoadingState message={status} />;
  }

  function toggleBrand(brand: string) {
    setBrandFilter((current) =>
      current.includes(brand)
        ? current.filter((item) => item !== brand)
        : [...current, brand]
    );
  }

  return (
    <div className="-m-6 text-[#101828] md:-m-8">
      <div className="min-h-full rounded-[calc(2rem-1px)] bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)] p-4 shadow-[0_30px_90px_rgba(23,37,84,0.16)] md:p-6">
        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-[1.75rem] bg-white/88 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.18)]">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c8aa5]">
                Dashboard / Cars
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#0f172a]">
                Filters
              </h1>
              <p className="text-sm leading-6 text-[#667085]">
                Refine inventory with the same filters already used in the marketplace flow.
              </p>
            </div>

            <div className="mt-8 space-y-8">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#111827]">Brand</h2>
                  {brandFilter.length > 0 ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-[#295bff]"
                      onClick={() => setBrandFilter([])}
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3">
                  {availableBrands.map((brand) => {
                    const checked = brandFilter.includes(brand);

                    return (
                      <label key={brand} className="flex items-center gap-3 text-sm text-[#344054]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleBrand(brand)}
                          className="h-4 w-4 rounded border-[#c7d2fe] text-[#295bff] focus:ring-[#295bff]"
                        />
                        <span>{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4 border-t border-[#e8eef7] pt-6">
                <h2 className="text-base font-semibold text-[#111827]">Price range</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <label className="space-y-2 text-sm text-[#667085]">
                    <span>Minimum</span>
                    <input
                      type="number"
                      value={minPriceFilter}
                      onChange={(event) => setMinPriceFilter(event.target.value)}
                      placeholder="10000"
                      className="h-11 w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 text-sm text-[#111827] outline-none transition focus:border-[#295bff]"
                    />
                  </label>
                  <label className="space-y-2 text-sm text-[#667085]">
                    <span>Maximum</span>
                    <input
                      type="number"
                      value={maxPriceFilter}
                      onChange={(event) => setMaxPriceFilter(event.target.value)}
                      placeholder="200000"
                      className="h-11 w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 text-sm text-[#111827] outline-none transition focus:border-[#295bff]"
                    />
                  </label>
                </div>
              </section>

              <section className="border-t border-[#e8eef7] pt-6">
                <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,#e9f1ff_0%,#f8fbff_100%)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c8aa5]">
                    Inventory snapshot
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[#0f172a]">
                    {filteredCars.length}
                  </p>
                  <p className="mt-2 text-sm text-[#667085]">
                    Active listings match your current dashboard view.
                  </p>
                </div>
              </section>
            </div>
          </aside>

          <section className="rounded-[1.75rem] bg-white/84 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.16)] md:p-6">
            <div className="flex flex-col gap-4 border-b border-[#e8eef7] pb-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c8aa5]">
                  Inventory board
                </p>
                <h2 className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#0f172a]">
                  Compare cars, manage faster
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#667085]">
                  Review your current inventory, adjust filters, and jump straight into listing updates.
                </p>
              </div>

              <Link href="/dashboard/cars/new">
                <Button className="h-12 rounded-2xl bg-[#295bff] px-6 text-white hover:bg-[#204de2]">
                  Create car
                </Button>
              </Link>
            </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
              <label className="space-y-2 text-sm text-[#667085]">
                <span>Brand</span>
                <div className="rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 py-3 text-sm text-[#111827]">
                  {brandFilter.length > 0 ? brandFilter.join(", ") : "All selected brands"}
                </div>
              </label>

              <label className="space-y-2 text-sm text-[#667085]">
                <span>Year</span>
                <select
                  value={yearFilter}
                  onChange={(event) => setYearFilter(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-[#f8fbff] px-4 text-sm text-[#111827] outline-none transition focus:border-[#295bff]"
                >
                  <option value="">All years</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setBrandFilter([]);
                    setYearFilter("");
                    setMinPriceFilter("");
                    setMaxPriceFilter("");
                  }}
                  className="h-12 w-full rounded-2xl border border-[#dbe4f0] bg-white text-sm font-medium text-[#111827] transition hover:border-[#295bff] hover:text-[#295bff]"
                >
                  Reset filters
                </button>
              </div>
            </div>

            {cars.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No cars yet"
                  description="Once inventory is added, your listings will appear here with quick edit and delete actions."
                  actionLabel="Create your first car"
                  actionHref="/dashboard/cars/new"
                />
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No cars match these filters"
                  description="Try widening the price range or clearing a brand selection to bring listings back into view."
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredCars.map((car) => (
                  <article
                    key={car.id}
                    className="overflow-hidden rounded-[1.75rem] border border-[#e5edf8] bg-white p-4 shadow-[0_18px_45px_rgba(148,163,184,0.14)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
                        <span className="text-[#f4b400]">★</span>
                        <span>{(4 + ((car.id % 10) / 10)).toFixed(1)}</span>
                      </div>
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#295bff]">
                        {car.year}
                      </span>
                    </div>

                    <div className="pb-3 pt-4">
                      <div className="overflow-hidden rounded-[1.35rem] border border-[#eef2f7] bg-white">
                        {car.main_image_url ? (
                          <img
                            src={car.main_image_url}
                            alt={car.title}
                            className="aspect-[16/10] h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex aspect-[16/10] items-center justify-center text-sm text-[#7c8aa5]">
                            No image available
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[#98a2b3]">
                          Vehicle
                        </p>
                        <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#0f172a]">
                          {car.title}
                        </h3>
                        <p className="mt-1 text-xs text-[#667085]">
                          {car.brand} {car.model} • {car.dealer.name}
                        </p>
                      </div>

                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-[#98a2b3]">
                            Price
                          </p>
                          <p className="mt-1.5 text-base font-semibold text-[#111827]">
                            {formatPrice(car.price)}
                          </p>
                          <p className="mt-1 text-xs text-[#667085]">
                            {car.mileage.toLocaleString()} miles
                          </p>
                        </div>
                        <Link
                          href={`/cars/${car.id}`}
                          className="text-xs font-medium text-[#295bff] hover:text-[#204de2]"
                        >
                          View details
                        </Link>
                      </div>

                      <div>
                        <Link href={`/dashboard/cars/${car.id}/edit`}>
                          <Button className="h-10 w-full rounded-2xl bg-[#295bff] text-xs text-white hover:bg-[#204de2]">
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
