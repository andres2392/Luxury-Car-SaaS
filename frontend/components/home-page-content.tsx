"use client";

import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Gem,
  Scale,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCars } from "@/lib/api";
import type { Car } from "@/lib/types";

const heroImageUrl =
  "/homepage/custom-bentley-hero.png";
const certifiedImageUrl =
  "/homepage/certified-showroom.png";
const sellImageUrl =
  "/luxury-gallery/mountain-coupe.png";

const showcaseCars = [
  {
    brand: "Ferrari",
    model: "Ferrari 488 GTB",
    year: "2018",
    mileage: "9,420 mi",
    price: "$249,900",
    location: "Miami, FL",
    image: "/homepage/bentley-inspired-hero.png",
    accent: "from-[#394E46] via-[#26352F] to-[#010101]",
  },
  {
    brand: "Lamborghini",
    model: "Lamborghini Huracan",
    year: "2020",
    mileage: "6,180 mi",
    price: "$279,500",
    location: "Los Angeles, CA",
    image: "/luxury-gallery/hotel-arrival.png",
    accent: "from-[#394E46] via-[#26352F] to-[#010101]",
  },
  {
    brand: "Porsche",
    model: "Porsche 911 GT3 RS",
    year: "2019",
    mileage: "4,870 mi",
    price: "$229,000",
    location: "Greenwich, CT",
    image: "/luxury-gallery/mountain-coupe.png",
    accent: "from-[#394E46] via-[#26352F] to-[#010101]",
  },
  {
    brand: "McLaren",
    model: "McLaren 720S",
    year: "2021",
    mileage: "3,940 mi",
    price: "$312,800",
    location: "Newport Beach, CA",
    image: "/luxury-gallery/private-showroom.png",
    accent: "from-[#394E46] via-[#26352F] to-[#010101]",
  },
  {
    brand: "Rolls-Royce",
    model: "Rolls-Royce Ghost",
    year: "2022",
    mileage: "7,210 mi",
    price: "$329,900",
    location: "Palm Beach, FL",
    image: "/homepage/certified-showroom.png",
    accent: "from-[#394E46] via-[#26352F] to-[#010101]",
  },
  {
    brand: "Aston Martin",
    model: "Aston Martin DB11",
    year: "2023",
    mileage: "2,850 mi",
    price: "$218,700",
    location: "Dallas, TX",
    image: "/homepage/luxury-generated-hero.png",
    accent: "from-[#394E46] via-[#26352F] to-[#010101]",
  },
];

const luxuryBrands = [
  { name: "Ferrari", mark: "FERRARI", style: "tracking-[0.34em]" },
  { name: "Lamborghini", mark: "L", style: "font-serif text-2xl" },
  { name: "McLaren", mark: "McLaren", style: "text-lg italic tracking-[-0.03em]" },
  { name: "Porsche", mark: "P", style: "font-serif text-2xl" },
  { name: "Rolls-Royce", mark: "RR", style: "font-serif text-xl tracking-[0.08em]" },
  { name: "Aston Martin", mark: "ASTON MARTIN", style: "text-[10px] tracking-[0.18em]" },
  { name: "Bugatti", mark: "BUGATTI", style: "tracking-[0.18em]" },
];

const certifiedBenefits = [
  {
    title: "Complete peace of mind",
    icon: ShieldCheck,
  },
  {
    title: "An extraordinary collection",
    icon: Gem,
  },
  {
    title: "A trusted valuation",
    icon: Scale,
  },
];

const lifestyleGallery = [
  {
    src: "/luxury-gallery/hotel-arrival.png",
    alt: "Black exotic coupe in a warm architectural showroom",
  },
  {
    src: "/luxury-gallery/detail-atelier.png",
    alt: "Emerald performance car wheel and carbon bodywork detail",
  },
  {
    src: "/luxury-gallery/mountain-coupe.png",
    alt: "White ultra-luxury SUV arriving at a private hotel entrance",
  },
  {
    src: "/luxury-gallery/private-showroom.png",
    alt: "Silver grand touring coupe driving through mountain roads at sunrise",
  },
];

const footerColumns = [
  {
    title: "Models",
    links: ["Ferrari", "Lamborghini", "McLaren", "Porsche", "Rolls-Royce", "Aston Martin"],
  },
  {
    title: "Your Collection",
    links: ["Service and Maintenance", "Ownership Support", "Technology", "Finance Services", "Accessories"],
  },
  {
    title: "Lifestyle",
    links: ["Experiences", "Architecture and Design", "Automotive", "Audio"],
  },
  {
    title: "About",
    links: ["News", "Environmental Foundation", "Beyond 100+", "History and Heritage", "People and Expertise", "Factory Tours"],
  },
  {
    title: "Corporate",
    links: ["Sitemap", "Contact Us", "Terms and Conditions", "Privacy Policy", "Cookies Policy", "Cookie Settings", "Recalls", "Battery Passport"],
  },
];

const footerSocialLinks = ["f", "X", "yt", "p", "ig", "tt", "in"];

export function HomePageContent() {
  const router = useRouter();
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    async function loadFeaturedCars() {
      try {
        const data = await getCars();
        setCars(data.slice(0, showcaseCars.length));
      } catch {
        setCars([]);
      }
    }

    void loadFeaturedCars();
  }, []);

  return (
    <div className="bg-[linear-gradient(180deg,#010101_0%,#0A0E0C_22%,#26352F_42%,#26352F_58%,#26352F_70%,#0A0E0C_84%,#010101_100%)] text-[#F5F5F2]">
      <section className="relative min-h-[72vh] overflow-hidden bg-[#010101]">
        <img
          src={heroImageUrl}
          alt="Bentley-inspired exotic car in a modern architectural setting"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-100 [filter:brightness(1.12)_contrast(1.08)_saturate(1.03)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.88)_28%,rgba(0,0,0,0.62)_43%,rgba(0,0,0,0.28)_58%,rgba(0,0,0,0.08)_75%,rgba(0,0,0,0.02)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(255,220,170,0.14),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,12,0.04)_0%,rgba(10,14,12,0)_42%,rgba(10,14,12,0.1)_100%)]" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-[1440px]">
          <div className="relative z-20 flex items-center px-6 py-16 sm:px-10 md:py-20 lg:w-[52%] lg:px-12 xl:pl-20">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F5F5F2]">
                Curated Exotic Automobiles
              </p>
              <h1 className="mt-6 max-w-lg font-heading text-4xl leading-[0.98] tracking-[-0.035em] text-[#F5F5F2] sm:text-5xl lg:text-[4rem]">
                Rare. Refined. Remarkable.
              </h1>
              <div className="mt-6 h-px w-14 bg-[#F5F5F2]/64" />
              <p className="mt-6 max-w-lg text-sm leading-7 text-[#C8C8C2]/72">
                Rare Ferrari, Lamborghini, McLaren, Porsche, Rolls-Royce, Aston Martin,
                and Bugatti models selected for collectors and performance enthusiasts.
              </p>

              <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  className="h-10 rounded-none border-white/24 bg-transparent px-6 text-sm text-[#F5F5F2] shadow-none hover:bg-white/8 hover:text-[#F5F5F2]"
                  onClick={() => router.push("/cars")}
                >
                  Search Inventory
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="h-10 rounded-none border-white/24 bg-transparent px-6 text-sm text-[#F5F5F2] shadow-none hover:bg-white/8 hover:text-[#F5F5F2]"
                >
                  <Link href="#sell">Sell Your Vehicle</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Trusted luxury marques" className="backdrop-blur-sm">
        <div className="mx-auto max-w-[1240px] px-6 py-8 text-center sm:px-10 lg:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F5F5F2]">
            Trusted by enthusiasts
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-y-5 text-[#C8C8C2]/46">
            {luxuryBrands.map((brand, index) => (
              <div key={brand.name} className="flex items-center">
                {index > 0 ? (
                  <span className="mx-6 text-[#C8C8C2]/22" aria-hidden="true">
                    |
                  </span>
                ) : null}
                <div
                  aria-label={brand.name}
                  className={`min-w-20 text-center text-xs font-semibold uppercase transition hover:text-[#F5F5F2] ${brand.style}`}
                >
                  {brand.mark}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-6 py-16 backdrop-blur-sm sm:px-10 md:py-24 lg:px-12">
        <div className="mx-auto grid max-w-[1240px] gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div className="relative min-h-[390px] md:min-h-[560px]">
            <figure className="absolute right-0 top-0 h-[64%] w-[68%] overflow-hidden bg-[#394E46]">
              <img
                src={lifestyleGallery[1].src}
                alt={lifestyleGallery[1].alt}
                className="h-full w-full object-cover opacity-86 transition duration-700 hover:scale-[1.02]"
              />
            </figure>
            <figure className="absolute bottom-0 left-0 h-[64%] w-[82%] overflow-hidden bg-[#394E46]">
              <img
                src={certifiedImageUrl}
                alt="Luxury grand touring car in a dark private showroom with warm architectural lighting"
                className="h-full w-full object-cover opacity-92 transition duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0)_0%,rgba(1,1,1,0.16)_62%,rgba(1,1,1,0.46)_100%)]" />
            </figure>
          </div>

          <div className="relative lg:pl-12">
            <div className="absolute left-0 top-1 hidden h-full w-px bg-[linear-gradient(180deg,#F5F5F2_0%,rgba(245,245,242,0.2)_66%,rgba(245,245,242,0)_100%)] lg:block" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5F5F2]">
              Certified Collection Program
            </p>
            <h2 className="mt-5 max-w-xl font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#F5F5F2] sm:text-5xl">
              The rarest of opportunities
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#C8C8C2]/66">
              Every vehicle in our collection is selected with care, reviewed for
              provenance, and inspected by specialists before presentation.
            </p>

            <div className="mt-10 space-y-6">
              {certifiedBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex items-center gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#F5F5F2]">
                      <Icon className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <span className="h-px w-10 shrink-0 bg-[#F5F5F2]/34" />
                    <p className="font-heading text-xl tracking-[-0.02em] text-[#F5F5F2]">
                      {benefit.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button
              asChild
              variant="secondary"
              className="mt-10 h-11 rounded-none border-white/24 bg-transparent px-7 text-sm text-[#F5F5F2] shadow-none hover:bg-white/8 hover:text-[#F5F5F2]"
            >
              <Link href="#inventory">Learn More About Our Program</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-6 py-16 text-[#F5F5F2] sm:px-10 md:py-24 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5F5F2]">
                Luxury Lifestyle Gallery
              </p>
              <h3 className="mt-3 max-w-xl font-heading text-3xl leading-[1.02] tracking-[-0.03em] text-[#F5F5F2] sm:text-4xl">
                Private moments around the collection.
              </h3>
            </div>
            <div className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(191,164,106,0.42),rgba(191,164,106,0))] md:block" />
          </div>

          <div className="grid gap-4 md:grid-cols-12 md:items-end">
            {[
              { item: lifestyleGallery[2], className: "md:col-span-3 md:translate-y-4", minHeight: "min-h-[210px]" },
              { item: lifestyleGallery[1], className: "md:col-span-2 md:-translate-y-8", minHeight: "min-h-[280px]" },
              { item: lifestyleGallery[3], className: "md:col-span-3", minHeight: "min-h-[230px]" },
              { item: lifestyleGallery[0], className: "md:col-span-4 md:translate-y-6", minHeight: "min-h-[260px]" },
            ].map(({ item, className, minHeight }) => (
              <figure
                key={item.src}
                className={`group relative overflow-hidden border border-[#BFA46A]/12 bg-[#394E46]/70 ${className}`}
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  className={`h-full ${minHeight} w-full object-cover opacity-88 transition duration-700 group-hover:scale-[1.025] group-hover:opacity-100 md:min-h-0`}
                />
              </figure>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-[#C8C8C2]/58">
            <button
              type="button"
              aria-label="Previous gallery image"
              className="flex h-9 w-9 items-center justify-center border border-[#BFA46A]/14 bg-transparent transition hover:border-[#BFA46A]/52 hover:text-[#F5F5F2]"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-px w-28 bg-[#C8C8C2]/16 sm:w-40">
              <div className="h-px w-2/5 bg-[#F5F5F2]" />
            </div>
            <button
              type="button"
              aria-label="Next gallery image"
              className="flex h-9 w-9 items-center justify-center border border-[#BFA46A]/14 bg-transparent transition hover:border-[#BFA46A]/52 hover:text-[#F5F5F2]"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section id="inventory" className="mx-auto max-w-[1240px] px-6 py-16 sm:px-10 md:py-24 lg:px-12">
        <div className="flex flex-col justify-between gap-6 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F5F5F2]">
              Luxury Inventory
            </p>
            <h2 className="mt-4 max-w-2xl font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#F5F5F2] sm:text-5xl">
              Collector-grade arrivals.
            </h2>
          </div>
          <Button
            variant="secondary"
            className="w-fit rounded-none border-white/24 bg-transparent text-[#F5F5F2] shadow-none hover:bg-white/8 hover:text-[#F5F5F2]"
            onClick={() => router.push("/cars")}
          >
            Browse all inventory
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-8 xl:grid-cols-3">
          {showcaseCars.map((car, index) => {
            const apiCar = cars[index];
            const detailsHref = apiCar ? `/cars/${apiCar.id}` : "/cars";

            return (
              <Card
                key={car.model}
                className="group overflow-hidden rounded-none border border-[#BFA46A]/12 bg-[#394E46]/12 shadow-none transition duration-500 hover:-translate-y-1 hover:bg-[#26352F]/16"
              >
                <Link href={detailsHref} className="block">
                  <div
                    className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${car.accent}`}
                  >
                    <img
                      src={car.image}
                      alt={apiCar?.title || car.model}
                      className="h-full w-full object-cover opacity-100 transition duration-700 group-hover:scale-[1.025]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0.04)_0%,rgba(1,1,1,0.2)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(0deg,rgba(1,1,1,0.62),rgba(1,1,1,0))]" />
                    <div className="absolute bottom-4 left-4 bg-[#394E46]/54 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F5F5F2]/70 backdrop-blur-md">
                      {car.brand}
                    </div>
                  </div>
                </Link>
                <CardContent className="space-y-5 p-5">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F5F5F2]">
                      {car.brand}
                    </p>
                    <Link href={detailsHref}>
                      <h3 className="font-heading text-2xl leading-[1.02] tracking-[-0.035em] text-[#F5F5F2] sm:text-3xl">
                        {car.model}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#C8C8C2]/72">
                        {car.year} / {car.mileage}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#C8C8C2]/50">
                        {car.location}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#F5F5F2]">
                        {car.price}
                      </p>
                    </div>
                    <Link
                      href={detailsHref}
                      className="pb-0.5 text-sm font-medium text-[#C8C8C2] transition hover:text-[#F5F5F2]"
                    >
                      View Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </section>

      <div className="text-[#F2EEE6]">
      <section
        id="sell"
        className="relative overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,18,16,0)_0%,rgba(14,18,16,0.12)_12%,rgba(22,33,28,0.42)_30%,rgba(35,49,42,0.76)_62%,#3F4F47_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(199,179,138,0.06),transparent_24%),radial-gradient(circle_at_22%_26%,rgba(255,246,230,0.03),transparent_22%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(14,18,16,0.08)_0%,rgba(22,33,28,0.06)_34%,rgba(35,49,42,0.08)_72%,rgba(63,79,71,0.12)_100%)]" />

        <div className="relative mx-auto grid min-h-[540px] max-w-[1440px] gap-10 px-6 pb-20 pt-12 sm:px-10 md:pb-24 md:pt-16 lg:grid-cols-[0.42fr_0.58fr] lg:items-center lg:px-12 xl:px-20">
          <div className="relative z-10 max-w-md lg:pl-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#C7B38A]/88">
              Sell / Consign
            </p>
            <h2 className="mt-5 max-w-[9.5ch] font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#F2EEE6] sm:text-5xl">
              Best SoFlo collection.
            </h2>
            <div className="mt-6 h-px w-14 bg-[#C7B38A]/34" />
            <p className="mt-7 max-w-[31rem] text-sm leading-7 text-[#DAD5CB]/74">
              Present your vehicle through a more discreet editorial process, with specialist valuation,
              tailored market positioning, and a buyer network shaped around collector-grade automobiles.
            </p>
            <Button
              variant="secondary"
              className="mt-8 h-9 rounded-none border-[#C7B38A]/58 bg-transparent px-5 text-xs uppercase tracking-[0.2em] text-[#F2EEE6] shadow-none transition duration-300 hover:border-[#C7B38A]/78 hover:bg-white/4 hover:text-[#F2EEE6]"
              onClick={() => router.push("/cars")}
            >
              Request Valuation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative min-h-[400px] lg:min-h-[520px]">
            <img
              src={sellImageUrl}
              alt="Luxury Bentley-style motor car in a warm architectural showroom"
              className="absolute inset-x-0 bottom-0 top-6 h-[calc(100%-1.5rem)] w-full object-cover object-[50%_center] opacity-[0.97] lg:top-8 lg:h-[calc(100%-2rem)]"
            />
            <div className="absolute inset-y-0 left-0 w-14 bg-[linear-gradient(90deg,rgba(18,23,20,0.34)_0%,rgba(18,23,20,0.12)_48%,transparent_100%)]" />
            <div className="absolute inset-y-0 right-0 w-12 bg-[linear-gradient(270deg,rgba(18,23,20,0.26)_0%,rgba(18,23,20,0.08)_44%,transparent_100%)]" />
            <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(18,23,20,0.22)_0%,rgba(18,23,20,0.06)_42%,transparent_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(0deg,rgba(18,23,20,0.18)_0%,rgba(18,23,20,0.05)_42%,transparent_100%)]" />
          </div>
        </div>

      </section>

      <footer className="bg-[#354F44] text-[#F2EEE6]">
        <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-12 sm:px-10 lg:px-12 xl:px-20">
          <div className="text-center">
            <Link href="/" className="mx-auto inline-flex flex-col items-center gap-1">
              <span className="font-heading text-3xl leading-none tracking-[0.04em]">LA</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em]">Luxury Auto</span>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
            {footerSocialLinks.map((item) => (
              <Link
                key={item}
                href="/"
                aria-label={`Social link ${item}`}
                className="flex h-5 min-w-5 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#F2EEE6]/88 transition hover:text-white"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="mt-12 border-t border-[#F2EEE6]/72 pt-10">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
              {footerColumns.map((column) => (
                <div key={column.title}>
                  <h3 className="text-lg font-light tracking-[0.04em] text-[#F2EEE6]">
                    {column.title}
                  </h3>
                  <div className="mt-7 space-y-5">
                    {column.links.map((item) => (
                      <Link
                        key={item}
                        href="/cars"
                        className="flex items-center gap-3 text-[11px] leading-4 text-[#F2EEE6]/84 transition hover:text-white"
                      >
                        {column.title === "Models" ? null : (
                          <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.6} />
                        )}
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-[#F2EEE6]/72 pt-8">
            <div className="text-xs leading-6 text-[#F2EEE6]/82">
              <p>© Copyright Luxury Auto 2026</p>
              <p className="mt-6 max-w-3xl">
                Registered office: Miami, Florida. Premium inventory presentation for rare,
                refined, and collector-grade automobiles.
              </p>
            </div>
          </div>
        </div>
      </footer>
      </div>

    </div>
  );
}
