"use client";

import { ArrowRight, Camera, ChevronDown, ChevronRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getCars } from "@/lib/api";
import type { Car } from "@/lib/types";

const fallbackImages = [
  "/images/hero/collector-icons-garage.webp",
  "/images/gallery/carrera-gt-gallery.webp",
  "/images/gallery/heritage-defender-gallery.webp",
  "/images/gallery/analog-detail.webp",
];

const carsPerPage = 15;

function formatPrice(price?: string | number | null) {
  if (price === null || price === undefined || price === "") {
    return "Price on request";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatMileage(mileage?: number | null) {
  if (mileage === null || mileage === undefined) {
    return "Mileage on request";
  }

  return `${mileage.toLocaleString()} mi`;
}

function buildGallery(car: Car, index: number) {
  const seededFallbacks = fallbackImages.map(
    (image, fallbackIndex) => fallbackImages[(index + fallbackIndex) % fallbackImages.length]
  );
  const images = [car.main_image_url, ...car.image_urls].filter(Boolean) as string[];
  const gallery = [...new Set([...images, ...seededFallbacks])];

  return gallery.slice(0, 4);
}

function buildSubtitle(car: Car) {
  if (car.description?.trim()) {
    return car.description;
  }

  return `${car.brand} ${car.model}`;
}

function buildLocation(car: Car) {
  return car.dealer?.name?.trim() || "Private Collection";
}

function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="border-b border-[#E2DDD3] pb-3">
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-full appearance-none border-0 bg-transparent px-0 pr-7 text-[14px] font-light text-[#2a2a2a] outline-none transition focus:text-[#3D4C45]"
        >
          <option value="">{label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-[#9a958d]" />
      </div>
    </div>
  );
}

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
  const [cars, setCars] = useState<Car[]>([]);
  const [make, setMake] = useState(initialBrand);
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [mileage, setMileage] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [exteriorColor, setExteriorColor] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const search = searchQuery.trim().toLowerCase();

  function updateFilter(setter: (value: string) => void, value: string) {
    setCurrentPage(1);
    setter(value);
  }

  useEffect(() => {
    async function loadCars() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getCars({
          brand: make,
          year,
          min_price: minPrice,
          max_price: maxPrice,
        });
        setCars(data);
      } catch {
        setCars([]);
        setError("Unable to load inventory.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadCars();
  }, [make, year, minPrice, maxPrice]);

  const makeOptions = [...new Set(cars.map((car) => car.brand).filter(Boolean))];
  const modelOptions = [...new Set(cars.map((car) => car.model).filter(Boolean))];
  const yearOptions = [...new Set(cars.map((car) => String(car.year)).filter(Boolean))];

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const subtitle = buildSubtitle(car).toLowerCase();
      const matchesSearch =
        !search ||
        [car.title, car.brand, car.model, subtitle].some((value) =>
          value.toLowerCase().includes(search)
        );
      const matchesModel = !model || car.model === model;

      const normalizedMileage = mileage.toLowerCase();
      const matchesMileage =
        !mileage ||
        (normalizedMileage === "under 5,000 mi" && car.mileage < 5000) ||
        (normalizedMileage === "5,000 - 10,000 mi" &&
          car.mileage >= 5000 &&
          car.mileage <= 10000) ||
        (normalizedMileage === "10,000+ mi" && car.mileage > 10000);

      const haystack =
        `${car.title} ${car.description ?? ""} ${car.brand} ${car.model}`.toLowerCase();
      const matchesBodyType = !bodyType || haystack.includes(bodyType.toLowerCase());
      const matchesExterior = !exteriorColor || haystack.includes(exteriorColor.toLowerCase());

      return matchesSearch && matchesModel && matchesMileage && matchesBodyType && matchesExterior;
    });
  }, [bodyType, cars, exteriorColor, mileage, model, search]);

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

  return (
    <div className="min-h-screen bg-[#FEFDFC] text-[#111111]">
      <section id="inventory" className="bg-[#FEFDFC]">
        <div className="mx-auto max-w-[1620px] px-4 pb-4 pt-2 sm:px-12 lg:px-16">
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <div className="flex h-11 items-center -translate-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8B877F]">
                Inventory Search
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(420px,1fr)] lg:items-center">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => updateFilter(setSearchQuery, event.target.value)}
                  placeholder="Search by name, model, make, or year"
                  className="h-11 w-full border-0 border-b border-[#DDD7CC] bg-transparent px-0 text-sm text-[#111111] outline-none placeholder:text-[#8B877F] focus:border-[#C5B48A]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1620px] px-4 pb-12 pt-6 sm:px-12 lg:px-16 lg:pb-14 lg:pt-8">
        <div className="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="h-fit bg-[#FEFDFC]">
            <div className="space-y-4 bg-[#FEFDFC] px-1 py-1">
              <div className="border-b border-[#E6E1D8] pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9a958d]">
                  Search scope
                </p>
                <p className="mt-2 text-[1.15rem] font-light tracking-[-0.03em] text-[#111111]">
                  USA
                </p>
              </div>

              <FilterField
                label="Make"
                value={make}
                onChange={(value) => updateFilter(setMake, value)}
                options={makeOptions}
              />
              <FilterField
                label="Model"
                value={model}
                onChange={(value) => updateFilter(setModel, value)}
                options={modelOptions}
              />
              <FilterField
                label="Year"
                value={year}
                onChange={(value) => updateFilter(setYear, value)}
                options={yearOptions}
              />
              <FilterField
                label="Min Price"
                value={minPrice}
                onChange={(value) => updateFilter(setMinPrice, value)}
                options={["50000", "100000", "200000", "300000"]}
              />
              <FilterField
                label="Max Price"
                value={maxPrice}
                onChange={(value) => updateFilter(setMaxPrice, value)}
                options={["200000", "300000", "400000", "500000"]}
              />
              <FilterField
                label="Mileage"
                value={mileage}
                onChange={(value) => updateFilter(setMileage, value)}
                options={["Under 5,000 mi", "5,000 - 10,000 mi", "10,000+ mi"]}
              />
              <FilterField
                label="Body Type"
                value={bodyType}
                onChange={(value) => updateFilter(setBodyType, value)}
                options={["Coupe", "Convertible", "Sedan", "SUV"]}
              />
              <FilterField
                label="Exterior Color"
                value={exteriorColor}
                onChange={(value) => updateFilter(setExteriorColor, value)}
                options={["Black", "White", "Silver", "Green", "Red"]}
              />

              <button
                type="button"
                onClick={() => {
                  setMake("");
                  setModel("");
                  setYear("");
                  setMinPrice("");
                  setMaxPrice("");
                  setMileage("");
                  setBodyType("");
                  setExteriorColor("");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#3D4C45] transition hover:text-[#111111]"
              >
                Reset filters
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </aside>

          <div className="space-y-7">
            {search ? (
              <p className="text-sm text-[#6E6A63]">
                Showing collector inventory matching{" "}
                <span className="font-medium text-[#111111]">{initialSearch}</span>.
              </p>
            ) : null}

            {isLoading ? (
              <p className="text-sm text-[#6E6A63]">Loading collector-grade vehicles...</p>
            ) : error ? (
              <p className="text-sm text-[#6E6A63]">Unable to load inventory.</p>
            ) : filteredCars.length === 0 ? (
              <p className="text-sm text-[#6E6A63]">No vehicles found.</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedCars.map((car, index) => {
                    const gallery = buildGallery(car, index);
                    const photoCount = (car.image_urls?.length ?? 0) + (car.main_image_url ? 1 : 0);

                    return (
                      <Link
                        key={car.id}
                        href={`/cars/${car.id}`}
                        scroll
                        className="group flex h-full flex-col overflow-hidden border border-[#DDD7CC] bg-white transition-colors hover:border-[#C5B48A]"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F2EC]">
                          <Image
                            src={gallery[0]}
                            alt={car.title}
                            fill
                            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
                            className="object-cover brightness-[1.05] contrast-[0.98] transition duration-500 group-hover:scale-[1.015]"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_58%,rgba(245,242,236,0.08)_100%)]" />
                          <div className="absolute right-4 top-4 inline-flex items-center gap-2 bg-[#ffffff]/92 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6A63]">
                            <Camera className="h-4 w-4 text-[#3D4C45]" />
                            {photoCount || gallery.length}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-px border-y border-[#DDD7CC] bg-[#DDD7CC]">
                          {gallery.slice(1, 4).map((thumbnail, thumbnailIndex) => (
                            <div
                              key={`${car.id}-${thumbnailIndex}`}
                              className="relative aspect-[16/10] bg-[#F5F2EC]"
                            >
                              <Image
                                src={thumbnail}
                                alt={`${car.title} gallery view ${thumbnailIndex + 1}`}
                                fill
                                sizes="(min-width: 1280px) 8vw, (min-width: 768px) 14vw, 33vw"
                                className="object-cover brightness-[1.03]"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-1 flex-col space-y-5 p-5 sm:space-y-6 sm:p-7">
                          <div className="space-y-3">
                            <h2
                              className="min-h-[3.54rem] font-heading text-[1.55rem] leading-[1.14] tracking-[-0.03em] text-[#111111]"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {car.title}
                            </h2>
                            <p
                              className="text-sm leading-6 text-[#6E6A63]"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {buildSubtitle(car)}
                            </p>
                            <p className="text-[1.45rem] font-light tracking-[-0.03em] text-[#111111] sm:text-[1.7rem]">
                              {formatPrice(car.price)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#DDD7CC] pt-5 text-[11px] uppercase tracking-[0.18em] text-[#8B877F]">
                            <span>{car.year}</span>
                            <span>{formatMileage(car.mileage)}</span>
                          </div>

                          <div className="mt-auto border-t border-[#DDD7CC] pt-5">
                            <div className="flex items-center gap-2 text-sm text-[#6E6A63]">
                              <MapPin className="h-4 w-4 text-[#3D4C45]" />
                              {buildLocation(car)}
                            </div>
                            <span className="mt-5 inline-flex h-11 items-center gap-2 px-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3D4C45] transition group-hover:text-[#111111]">
                              View Details
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="flex flex-col items-center justify-between gap-6 border-t border-[#DDD7CC] pt-8 sm:flex-row">
                  <p className="text-sm text-[#6E6A63]">
                    Showing {(visiblePage - 1) * carsPerPage + 1}-
                    {Math.min(visiblePage * carsPerPage, filteredCars.length)} of{" "}
                    {filteredCars.length} vehicles
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => goToPage(page)}
                          className={`flex h-10 w-10 items-center justify-center border text-sm transition ${
                            visiblePage === page
                              ? "border-[#3D4C45] bg-[#3D4C45] text-white"
                              : "border-[#DDD7CC] bg-white text-[#111111] hover:border-[#3D4C45]"
                          }`}
                          aria-label={`Go to page ${page}`}
                          aria-current={visiblePage === page ? "page" : undefined}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => goToPage(visiblePage + 1)}
                      disabled={visiblePage >= totalPages}
                      className="flex h-10 w-10 items-center justify-center border border-[#DDD7CC] bg-white text-[#3D4C45] transition hover:border-[#3D4C45] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
