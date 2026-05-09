"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { getMyCars } from "@/lib/api";
import type { Car } from "@/lib/types";

const carsPerPage = 6;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [minPriceFilter, setMinPriceFilter] = useState("");
  const [maxPriceFilter, setMaxPriceFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadCars() {
      try {
        const data = await getMyCars();
        setCars(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load cars.");
      }
    }

    void loadCars();
  }, []);

  const availableBrands = useMemo(
    () => [...new Set(cars.map((car) => car.brand))].sort((a, b) => a.localeCompare(b)),
    [cars]
  );

  const availableYears = useMemo(
    () => [...new Set(cars.map((car) => car.year))].sort((a, b) => b - a),
    [cars]
  );

  const filteredCars = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return cars.filter((car) => {
      const matchesBrand = brandFilter.length === 0 || brandFilter.includes(car.brand);
      const matchesYear = !yearFilter || String(car.year) === yearFilter;
      const numericPrice = Number(car.price);
      const matchesMin = !minPriceFilter || numericPrice >= Number(minPriceFilter);
      const matchesMax = !maxPriceFilter || numericPrice <= Number(maxPriceFilter);
      const matchesSearch =
        !normalizedSearch ||
        [car.title, car.brand, car.model, String(car.year), car.dealer.name].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );

      return matchesSearch && matchesBrand && matchesYear && matchesMin && matchesMax;
    });
  }, [brandFilter, cars, maxPriceFilter, minPriceFilter, searchQuery, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / carsPerPage));
  const visiblePage = Math.min(currentPage, totalPages);
  const paginatedCars = filteredCars.slice(
    (visiblePage - 1) * carsPerPage,
    visiblePage * carsPerPage
  );

  function goToPage(page: number) {
    const nextPage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status) {
    return <LoadingState message={status} />;
  }

  return (
    <div className="pr-6 text-[#f1eadf] lg:pr-10 xl:pr-14">
      <div className="min-h-full">
        <div>
          <section className="bg-[#1a1b18] p-5 md:p-6">
            <div className="grid gap-4 border-b border-[#31362f] pb-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8f968c]">
                  Inventory board
                </p>
                <div className="mt-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => {
                      setCurrentPage(1);
                      setSearchQuery(event.target.value);
                    }}
                    placeholder="Search by name, model, make, dealer, or year"
                    className="h-11 w-full border-0 border-b border-[#4b4c43] bg-transparent px-0 text-sm text-[#f1eadf] outline-none placeholder:text-[#8f968c] focus:border-[#C2A878]"
                  />
                </div>
              </div>

              <Link href="/dashboard/cars/new" className="xl:justify-self-end">
                <Button className="h-11 whitespace-nowrap rounded-[0.35rem] border border-[#4b4c43] bg-[#26352F] px-5 text-[#f1eadf] shadow-none hover:bg-[#31453d]">
                  Create car
                </Button>
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
              <label className="space-y-2 text-sm text-[#a7ab9f]">
                <span>Brand</span>
                <select
                  value={brandFilter[0] ?? ""}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setBrandFilter(event.target.value ? [event.target.value] : []);
                  }}
                  className="h-11 w-full border border-[#31352f] bg-[#171816] px-4 text-sm text-[#f1eadf] outline-none transition focus:border-[#f1eadf]"
                >
                  <option value="">All brands</option>
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm text-[#a7ab9f]">
                <span>Year</span>
                <select
                  value={yearFilter}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setYearFilter(event.target.value);
                  }}
                  className="h-11 w-full border border-[#31352f] bg-[#171816] px-4 text-sm text-[#f1eadf] outline-none transition focus:border-[#f1eadf]"
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
                    setSearchQuery("");
                    setYearFilter("");
                    setMinPriceFilter("");
                    setMaxPriceFilter("");
                    setCurrentPage(1);
                  }}
                  className="h-11 w-full rounded-[0.35rem] border border-[#4b4c43] bg-transparent text-sm font-medium text-[#f1eadf] transition hover:border-[#f1eadf] hover:text-[#f1eadf]"
                >
                  Reset filters
                </button>
              </div>
            </div>

            {cars.length === 0 ? (
              <div className="mt-6">
                <div className="bg-[#171816] p-8">
                  <h3 className="font-heading text-3xl tracking-[-0.03em] text-[#f1eadf]">
                    No cars yet
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-[#a7ab9f]">
                    Once inventory is added, your listings will appear here with quick edit actions.
                  </p>
                  <Link href="/dashboard/cars/new">
                    <Button className="mt-5 rounded-[0.35rem] border border-[#4b4c43] bg-[#26352F] text-[#f1eadf] shadow-none hover:bg-[#31453d]">
                      Create your first car
                    </Button>
                  </Link>
                </div>
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="mt-6">
                <div className="bg-[#171816] p-8">
                  <h3 className="font-heading text-3xl tracking-[-0.03em] text-[#f1eadf]">
                    No cars match these filters
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-7 text-[#a7ab9f]">
                    Try widening the price range or clearing a brand selection to bring listings back into view.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedCars.map((car) => (
                    <article
                      key={car.id}
                      className="flex h-full min-h-[470px] flex-col overflow-hidden bg-[#171816] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#f1eadf]">
                          <span className="text-[#f1eadf]">★</span>
                          <span>{(4 + ((car.id % 10) / 10)).toFixed(1)}</span>
                        </div>
                        <span className="border border-[#4b4c43] bg-[#1e201d] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#f1eadf]">
                          {car.year}
                        </span>
                      </div>

                      <div className="pb-3 pt-4">
                        <div className="overflow-hidden border border-[#2b302b] bg-[#1e201d]">
                          {car.main_image_url ? (
                            <img
                              src={car.main_image_url}
                              alt={car.title}
                              className="aspect-[16/10] h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex aspect-[16/10] items-center justify-center text-sm text-[#8f968c]">
                              No image available
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col space-y-2.5">
                        <div className="min-h-[88px]">
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f968c]">Vehicle</p>
                          <h3 className="mt-1.5 text-lg font-semibold tracking-[-0.03em] text-[#f1eadf]">
                            {car.title}
                          </h3>
                          <p className="mt-1 text-xs text-[#a7ab9f]">
                            {car.brand} {car.model} • {car.dealer.name}
                          </p>
                        </div>

                        <div className="mt-auto">
                          <div className="flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f968c]">Price</p>
                              <p className="mt-1.5 text-base font-semibold text-[#f1eadf]">
                                {formatPrice(car.price)}
                              </p>
                              <p className="mt-1 text-xs text-[#a7ab9f]">
                                {car.mileage.toLocaleString()} miles
                              </p>
                            </div>
                            <Link
                              href={`/cars/${car.id}`}
                              className="text-xs font-medium text-[#f1eadf] hover:text-[#a7ab9f]"
                            >
                              View details
                            </Link>
                          </div>
                        </div>

                        <div>
                          <Link href={`/dashboard/cars/${car.id}/edit`}>
                            <Button className="h-10 w-full rounded-[0.35rem] border border-[#4b4c43] bg-[#26352F] text-xs text-[#f1eadf] shadow-none hover:bg-[#31453d]">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-5 border-t border-[#31362f] pt-6 sm:flex-row">
                  <p className="text-sm text-[#a7ab9f]">
                    Showing {(visiblePage - 1) * carsPerPage + 1}-
                    {Math.min(visiblePage * carsPerPage, filteredCars.length)} of{" "}
                    {filteredCars.length} vehicles
                  </p>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`flex h-10 w-10 items-center justify-center border text-sm transition ${
                          visiblePage === page
                            ? "border-[#C2A878]/58 bg-[#C2A878]/14 text-[#f1eadf]"
                            : "border-[#4b4c43] bg-[#171816] text-[#a7ab9f] hover:border-[#C2A878]/42 hover:text-[#f1eadf]"
                        }`}
                        aria-label={`Go to page ${page}`}
                        aria-current={visiblePage === page ? "page" : undefined}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => goToPage(visiblePage + 1)}
                      disabled={visiblePage === totalPages}
                      className="h-10 border border-[#4b4c43] bg-[#171816] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f1eadf] transition hover:border-[#C2A878]/42 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
