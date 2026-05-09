"use client";

import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { getCarById } from "@/lib/api";
import type { Car } from "@/lib/types";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatMileage(mileage: number) {
  return `${mileage.toLocaleString()} miles`;
}

function inferExteriorColor(car: Car) {
  const text = `${car.title} ${car.description ?? ""}`.toLowerCase();

  if (text.includes("rosso corsa")) return "Rosso Corsa";
  if (text.includes("verde")) return "Verde Mantis";
  if (text.includes("chalk")) return "Chalk";
  if (text.includes("onyx") || text.includes("black")) return "Onyx Black";
  if (text.includes("silver")) return "Moonbeam Silver";
  if (text.includes("white")) return "Glacier White";
  if (text.includes("green")) return "Verdant";
  if (text.includes("red") || text.includes("fireglow")) return "Fireglow";

  return car.brand.toLowerCase().includes("ferrari") ? "Rosso Corsa" : "Onyx Black";
}

function inferInteriorColor(car: Car) {
  const text = `${car.title} ${car.description ?? ""}`.toLowerCase();

  if (text.includes("nero")) return "Nero";
  if (text.includes("bordeaux")) return "Bordeaux Red";
  if (text.includes("carbon black")) return "Carbon Black";
  if (text.includes("beluga")) return "Beluga hide";
  if (text.includes("fireglow")) return "Fireglow and Beluga hide";
  if (text.includes("tan") || text.includes("camel")) return "Camel hide";

  return car.brand.toLowerCase().includes("ferrari") ? "Nero" : "Beluga hide";
}

const fallbackGallery = [
  "/images/hero/collector-icons-garage.webp",
  "/images/gallery/carrera-gt-gallery.webp",
  "/images/gallery/heritage-defender-gallery.webp",
  "/images/gallery/analog-detail.webp",
];

export function CarDetailContent({ carId }: { carId: string }) {
  const [car, setCar] = useState<Car | null>(null);
  const [status, setStatus] = useState("Loading vehicle details...");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [carId]);

  useEffect(() => {
    async function loadCar() {
      try {
        const data = await getCarById(carId);
        setCar(data);
        setStatus("");
      } catch {
        setCar(null);
        setStatus("Unable to load vehicle.");
      }
    }

    void loadCar();
  }, [carId]);

  const gallery = useMemo(() => {
    if (!car) {
      return fallbackGallery;
    }

    const images = [car.main_image_url, ...car.image_urls, ...fallbackGallery].filter(Boolean);
    return [...new Set(images)] as string[];
  }, [car]);

  const isLightboxOpen = activeImageIndex !== null;

  const closeLightbox = useCallback(() => {
    setActiveImageIndex(null);
  }, []);

  const showPreviousImage = useCallback(() => {
    setActiveImageIndex((current) => {
      if (current === null) {
        return current;
      }

      return (current - 1 + gallery.length) % gallery.length;
    });
  }, [gallery.length]);

  const showNextImage = useCallback(() => {
    setActiveImageIndex((current) => {
      if (current === null) {
        return current;
      }

      return (current + 1) % gallery.length;
    });
  }, [gallery.length]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, isLightboxOpen, showNextImage, showPreviousImage]);

  if (!car) {
    return <LoadingState message={status} />;
  }

  const exteriorColor = inferExteriorColor(car);
  const interiorColor = inferInteriorColor(car);
  const location = car.dealer?.name?.trim() || "Private Collection";
  const fuelType = car.brand.toLowerCase().includes("ferrari") ? "Petrol" : "Gasoline";
  const bodyType =
    car.model.toLowerCase().includes("urus") || car.title.toLowerCase().includes("suv")
      ? "SUV"
      : car.model.toLowerCase().includes("spider")
        ? "Convertible"
        : "Coupe";

  const specs = [
    ["Fuel Type", fuelType],
    ["Engine", car.brand === "Ferrari" ? "3.9L V8" : "Grand touring powertrain"],
    ["Driver Position", "LHD"],
    ["Odometer", formatMileage(car.mileage)],
    ["Transmission", "Automatic"],
    ["Body Style", bodyType],
    ["Model Year", String(car.year)],
    ["Registration Date", `04.${car.year}`],
    ["Exterior", exteriorColor],
    ["Interior", interiorColor],
  ];

  function handleEnquire() {
    if (!car) {
      return;
    }

    const subject = encodeURIComponent(`Enquiry for ${car.title}`);
    window.location.href = `mailto:${car.dealer.contact_email}?subject=${subject}`;
  }

  return (
    <main className="min-h-screen bg-[#FEFDFC] text-[#171717]">
      <section className="px-5 pb-2 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1540px] items-center">
          <Link
            href="/cars"
            className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6E6A63] transition duration-300 hover:text-[#B79F73]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back
          </Link>
        </div>
      </section>

      <section className="bg-[#FEFDFC] px-5 pb-5 pt-2 sm:px-8 sm:pb-6 sm:pt-3 lg:px-12">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-2 bg-[#FEFDFC] lg:grid-cols-[1.15fr_0.85fr]">
            <figure className="relative min-h-[250px] overflow-hidden bg-[#EFE9DF] lg:h-[440px]">
              <button
                type="button"
                className="block h-full w-full cursor-zoom-in"
                onClick={() => setActiveImageIndex(0)}
                aria-label={`Open ${car.title} image 1 fullscreen`}
              >
              <img
                src={gallery[0]}
                alt={car.title}
                className="h-full w-full object-cover brightness-[1.04] saturate-[0.96]"
              />
              </button>
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-3 border border-[#D8D0C4] bg-[#FEFDFC]/88 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6E6A63] backdrop-blur-sm">
                <Camera className="h-4 w-4" strokeWidth={1.5} />
                {gallery.length} photos
              </div>
            </figure>

            <div className="grid grid-cols-2 gap-2 lg:h-[440px] lg:grid-rows-2">
              {gallery.slice(1, 5).map((image, index) => (
                <figure key={`${image}-${index}`} className="group aspect-square overflow-hidden bg-[#EFE9DF] lg:aspect-auto lg:h-full">
                  <button
                    type="button"
                    className="block h-full w-full cursor-zoom-in"
                    onClick={() => setActiveImageIndex(index + 1)}
                    aria-label={`Open ${car.title} image ${index + 2} fullscreen`}
                  >
                  <img
                    src={image}
                    alt={`${car.title} supporting image ${index + 1}`}
                    className="h-full w-full object-cover brightness-[1.03] saturate-[0.96] transition duration-700 ease-out group-hover:scale-[1.035]"
                  />
                  </button>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 pt-2 text-center sm:px-8 sm:pb-12 sm:pt-3 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mx-auto max-w-4xl text-4xl font-light leading-[1.08] tracking-[0.02em] text-[#171717] sm:text-5xl lg:text-[3.7rem]">
            {car.title || `${car.year} ${car.brand} ${car.model}`}
          </h1>
          <p className="mt-5 text-3xl font-light leading-tight tracking-[0.02em] text-[#171717] sm:text-[2rem]">
            {car.price ? formatPrice(car.price) : "Price on request"}
          </p>
          <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.34em] text-[#171717]">
            {car.dealer?.name?.trim() || "Private Collection"}
          </p>
          <p className="mt-3 text-sm tracking-[0.08em] text-[#6E6A63]">{location}</p>
        </div>
      </section>

      <section id="vehicle-enquiry" className="px-5 pb-16 text-center sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            type="button"
            className="h-11 rounded-none border border-[#34483F] bg-[#34483F] px-9 text-[10px] uppercase tracking-[0.3em] text-white shadow-none transition duration-300 hover:bg-[#25362F]"
            onClick={handleEnquire}
          >
            Enquire to Buy
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 rounded-none border-[#34483F] bg-transparent px-9 text-[10px] uppercase tracking-[0.3em] text-[#34483F] shadow-none transition duration-300 hover:bg-[#F5F2EC]"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" strokeWidth={1.5} />
            Print
          </Button>
        </div>
      </section>

      <section className="bg-[#FEFDFC] px-5 pb-24 pt-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1420px]">
          <h2 className="text-center text-4xl font-light tracking-[0.06em] text-[#171717] sm:text-5xl">
            Summary Information
          </h2>

          <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {specs.map(([label, value]) => (
              <div key={label} className="border-b border-[#6E6A63] pb-4 text-left">
                <p className="text-[12px] tracking-[0.02em] text-[#171717]">
                  {label}: {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-3xl text-center">
            <p className="text-base leading-8 text-[#6E6A63]">
              {car.description ??
                `This ${car.year} ${car.brand} ${car.model} is presented in ${exteriorColor} with ${interiorColor} interior, selected for its specification, condition, and collector appeal.`}
            </p>
          </div>
        </div>
      </section>

      {isLightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/94 text-white backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${car.title} image gallery`}
        >
          <div className="flex items-center justify-between px-5 py-4 sm:px-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8c7a0]">
              {(activeImageIndex ?? 0) + 1} / {gallery.length}
            </p>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center text-white/78 transition hover:text-white"
              aria-label="Close gallery"
            >
              <X className="h-6 w-6" strokeWidth={1.5} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-16">
            {gallery.length > 1 ? (
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/16 bg-black/18 text-white/78 transition hover:border-[#d8c7a0]/50 hover:text-white sm:left-6 sm:h-12 sm:w-12"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </button>
            ) : null}

            <img
              key={activeImageIndex}
              src={gallery[activeImageIndex ?? 0]}
              alt={`${car.title} fullscreen image ${(activeImageIndex ?? 0) + 1}`}
              className="max-h-full max-w-full scale-100 object-contain opacity-100 transition duration-300 ease-out"
            />

            {gallery.length > 1 ? (
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/16 bg-black/18 text-white/78 transition hover:border-[#d8c7a0]/50 hover:text-white sm:right-6 sm:h-12 sm:w-12"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
              </button>
            ) : null}
          </div>

          {gallery.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto px-5 pb-5 pt-3 sm:justify-center sm:px-8">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-thumb-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-16 w-24 shrink-0 overflow-hidden border transition sm:h-20 sm:w-32 ${
                    activeImageIndex === index
                      ? "border-[#d8c7a0]"
                      : "border-white/14 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img
                    src={image}
                    alt={`${car.title} thumbnail ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
