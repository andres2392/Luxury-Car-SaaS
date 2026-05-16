"use client";

import { ArrowRight, ChevronRight, ExternalLink, Gem, Scale, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCars } from "@/lib/api";
import type { Car } from "@/lib/types";

const heroImageUrl = "/images/hero/custom-hero-mustang.webp";
const certifiedImageUrl = "/images/gallery/carrera-gt-gallery.webp";
const sellImageUrl = "/images/services/sell-consign-lounge.webp";

const showcaseCars = [
  {
    brand: "Ferrari",
    model: "Ferrari 512 TR",
    year: "1994",
    mileage: "8,420 mi",
    price: "$389,500",
    location: "Private Collection Miami",
    image: "/images/hero/collector-icons-garage.webp",
    accent: "from-[#31463D] via-[#183028] to-[#090909]",
  },
  {
    brand: "Porsche",
    model: "Porsche 930 Turbo Slant Nose",
    year: "1988",
    mileage: "21,300 mi",
    price: "$315,000",
    location: "Greenwich, CT",
    image: "/images/gallery/analog-detail.webp",
    accent: "from-[#31463D] via-[#183028] to-[#090909]",
  },
  {
    brand: "Porsche",
    model: "Porsche Carrera GT",
    year: "2005",
    mileage: "6,180 mi",
    price: "$1,275,000",
    location: "Newport Beach, CA",
    image: "/images/gallery/carrera-gt-gallery.webp",
    accent: "from-[#31463D] via-[#183028] to-[#090909]",
  },
  {
    brand: "Ferrari",
    model: "Ferrari 550 Maranello",
    year: "2001",
    mileage: "14,900 mi",
    price: "$279,000",
    location: "Monterey, CA",
    image: "/images/gallery/heritage-defender-gallery.webp",
    accent: "from-[#31463D] via-[#183028] to-[#090909]",
  },
  {
    brand: "Aston Martin",
    model: "Aston Martin Vanquish",
    year: "2003",
    mileage: "18,200 mi",
    price: "$142,500",
    location: "Palm Beach, FL",
    image: "/images/gallery/carrera-gt-gallery.webp",
    accent: "from-[#31463D] via-[#183028] to-[#090909]",
  },
  {
    brand: "Land Rover",
    model: "Defender 110 Heritage",
    year: "1993",
    mileage: "31,400 mi",
    price: "$168,000",
    location: "Dallas, TX",
    image: "/images/gallery/heritage-defender-gallery.webp",
    accent: "from-[#31463D] via-[#183028] to-[#090909]",
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
    title: "Curated inventory",
    icon: ShieldCheck,
  },
  {
    title: "Global sourcing",
    icon: Gem,
  },
  {
    title: "Private storage",
    icon: Scale,
  },
];

const collectorServices = [
  {
    title: "Private Sourcing",
    description:
      "Quiet access to collector-grade opportunities through private owners, specialists, and international relationships.",
  },
  {
    title: "Worldwide Acquisition",
    description:
      "Guidance across inspection, valuation, negotiation, import handling, and enclosed delivery coordination.",
  },
  {
    title: "Storage & Concierge",
    description:
      "Discreet care for significant automobiles, from collection management to appointment-only presentation.",
  },
  {
    title: "Investment Grade Collection",
    description:
      "A considered lens on provenance, rarity, specification, condition, and long-term collector relevance.",
  },
];

const lifestyleGallery = [
  {
    src: "/images/gallery/heritage-defender-gallery.webp",
    alt: "Heritage collector vehicles in a warm private garage",
  },
  {
    src: "/images/gallery/analog-detail.webp",
    alt: "Analog-era sports car detail with warm cinematic shadows",
  },
  {
    src: "/images/gallery/carrera-gt-gallery.webp",
    alt: "Carrera GT inspired collector car in an architectural gallery",
  },
  {
    src: "/images/hero/collector-icons-garage.webp",
    alt: "Ferrari Testarossa inspired icon beside an air-cooled Porsche",
  },
];

const footerColumns = [
  {
    title: "Models",
    links: ["Ferrari", "Lamborghini", "McLaren", "Porsche", "Rolls-Royce", "Aston Martin"],
  },
  {
    title: "Your Collection",
    links: [
      "Service and Maintenance",
      "Ownership Support",
      "Technology",
      "Finance Services",
      "Accessories",
    ],
  },
  {
    title: "Lifestyle",
    links: ["Experiences", "Architecture and Design", "Automotive", "Audio"],
  },
  {
    title: "About",
    links: [
      "News",
      "Environmental Foundation",
      "Beyond 100+",
      "History and Heritage",
      "People and Expertise",
      "Factory Tours",
    ],
  },
  {
    title: "Corporate",
    links: [
      "Sitemap",
      "Contact Us",
      "Terms and Conditions",
      "Privacy Policy",
      "Cookies Policy",
      "Cookie Settings",
      "Recalls",
      "Battery Passport",
    ],
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
    <div className="bg-[linear-gradient(180deg,#090909_0%,#090909_18%,#10211B_30%,#183028_58%,#10211B_82%,#090909_100%)] text-[#F3EFE7]">
      <section className="relative min-h-[72vh] overflow-hidden bg-[#090909]">
        <Image
          src={heroImageUrl}
          alt="Bentley-inspired exotic car in a modern architectural setting"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-100 [filter:brightness(1.1)_contrast(1.06)_saturate(0.95)_sepia(0.05)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,0.97)_0%,rgba(9,9,9,0.9)_28%,rgba(9,9,9,0.64)_43%,rgba(9,9,9,0.3)_58%,rgba(9,9,9,0.08)_75%,rgba(9,9,9,0.02)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_50%,rgba(194,168,120,0.12),transparent_38%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,9,0.1)_0%,rgba(9,9,9,0)_44%,rgba(9,9,9,0.18)_100%)]" />

        <div className="relative mx-auto flex min-h-[72vh] max-w-[1440px]">
          <div className="relative z-20 flex items-center px-6 py-16 sm:px-10 md:py-20 lg:w-[52%] lg:px-12 xl:pl-20">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F3EFE7]">
                A Private World For Collectors
              </p>
              <h1 className="mt-6 max-w-2xl font-heading text-4xl leading-[0.94] tracking-[-0.045em] text-[#F3EFE7] sm:text-6xl lg:text-[5.2rem] lg:leading-[0.9]">
                Sourcing icons. Preserving legends.
              </h1>
              <div className="mt-6 h-px w-14 bg-[#C2A878]/48" />
              <p className="mt-6 max-w-xl text-sm leading-7 text-[#8E8A83]">
                A private automotive house for discerning collectors, offering curated acquisition,
                discreet consignment, and concierge support for significant motor cars.
              </p>

              <div className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  className="h-11 w-full rounded-none border-[#C2A878]/34 bg-transparent px-6 text-sm text-[#F3EFE7] shadow-none hover:bg-white/6 hover:text-[#F3EFE7] sm:w-auto"
                  onClick={() => router.push("/cars")}
                >
                  Begin Your Collection
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Trusted luxury marques" className="backdrop-blur-sm">
        <div className="mx-auto max-w-[1240px] px-6 py-8 text-center sm:px-10 lg:px-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F3EFE7]">
            Trusted by enthusiasts
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-y-5 text-[#8E8A83]/70">
            {luxuryBrands.map((brand, index) => (
              <div key={brand.name} className="flex items-center">
                {index > 0 ? (
                  <span className="mx-6 text-[#8E8A83]/34" aria-hidden="true">
                    |
                  </span>
                ) : null}
                <div
                  aria-label={brand.name}
                  className={`min-w-20 text-center text-xs font-semibold uppercase transition hover:text-[#F3EFE7] ${brand.style}`}
                >
                  {brand.mark}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-6 py-20 backdrop-blur-sm sm:px-10 md:py-32 lg:px-12">
        <div className="mx-auto grid max-w-[1240px] gap-16 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
          <div className="relative min-h-[390px] md:min-h-[560px]">
            <figure className="absolute right-0 top-0 h-[64%] w-[68%] overflow-hidden bg-[#183028]">
              <Image
                src={lifestyleGallery[1].src}
                alt={lifestyleGallery[1].alt}
                fill
                sizes="(min-width: 1024px) 420px, 68vw"
                className="h-full w-full object-cover opacity-86 transition duration-700 hover:scale-[1.02]"
              />
            </figure>
            <figure className="absolute bottom-0 left-0 h-[64%] w-[82%] overflow-hidden bg-[#183028]">
              <Image
                src={certifiedImageUrl}
                alt="Luxury grand touring car in a dark private showroom with warm architectural lighting"
                fill
                sizes="(min-width: 1024px) 510px, 82vw"
                className="h-full w-full object-cover opacity-92 transition duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0)_0%,rgba(1,1,1,0.16)_62%,rgba(1,1,1,0.46)_100%)]" />
            </figure>
          </div>

          <div className="relative lg:pl-12">
            <div className="absolute left-0 top-1 hidden h-full w-px bg-[linear-gradient(180deg,#C2A878_0%,rgba(194,168,120,0.22)_66%,rgba(194,168,120,0)_100%)] lg:block" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F3EFE7]">
              Who We Are
            </p>
            <h2 className="mt-5 max-w-xl font-heading text-5xl leading-[0.95] tracking-[-0.045em] text-[#F3EFE7] sm:text-6xl">
              A sanctuary for automotive excellence.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-[#8E8A83]">
              We work with collectors who value privacy, provenance, and restraint. Each opportunity
              is sourced, prepared, and presented with the care of a boutique hospitality experience
              rather than the pace of a marketplace.
            </p>

            <div className="mt-10 space-y-6">
              {certifiedBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex items-center gap-5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center text-[#F3EFE7]">
                      <Icon className="h-5 w-5" strokeWidth={1.4} />
                    </span>
                    <span className="h-px w-10 shrink-0 bg-[#C2A878]/34" />
                    <p className="font-heading text-xl tracking-[-0.02em] text-[#F3EFE7]">
                      {benefit.title}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button
              asChild
              variant="secondary"
              className="mt-10 h-11 rounded-none border-[#C2A878]/34 bg-transparent px-7 text-sm text-[#F3EFE7] shadow-none hover:bg-white/6 hover:text-[#F3EFE7]"
            >
              <Link href="#services">Explore Collector Services</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="services" className="px-6 py-20 sm:px-10 md:py-28 lg:px-12">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#F3EFE7]/82">
                Collector Services
              </p>
              <h2 className="mt-5 max-w-md font-heading text-5xl leading-[0.95] tracking-[-0.045em] text-[#F3EFE7] sm:text-6xl">
                Built around the life of the collection.
              </h2>
            </div>
            <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
              {collectorServices.map((service, index) => (
                <div key={service.title} className="pt-2">
                  <p className="text-xs text-[#8E8A83]/72">0{index + 1}</p>
                  <h3 className="mt-5 font-heading text-3xl leading-tight tracking-[-0.035em] text-[#F3EFE7]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[#8E8A83]">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden px-6 py-12 text-[#F3EFE7] sm:px-10 md:py-16 lg:px-12 xl:px-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end lg:mb-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F3EFE7]">
                The Private Garage
              </p>
              <h3 className="mt-3 max-w-xl font-heading text-3xl leading-[1.02] tracking-[-0.03em] text-[#F3EFE7] sm:text-4xl">
                Architecture, atmosphere, and the quiet theatre of rare automobiles.
              </h3>
            </div>
            <div className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(194,168,120,0.32),rgba(194,168,120,0))] md:block" />
          </div>

          <div className="relative mx-auto flex max-w-[1240px] flex-col gap-7 lg:h-[570px] lg:block">
            {[
              {
                item: lifestyleGallery[3],
                className:
                  "lg:absolute lg:left-1/2 lg:top-0 lg:z-20 lg:h-[235px] lg:w-[235px] lg:-translate-x-1/2",
                imageClass: "min-h-[235px] lg:min-h-0 lg:object-[54%_center]",
              },
              {
                item: lifestyleGallery[0],
                className: "lg:absolute lg:left-0 lg:top-[145px] lg:z-10 lg:h-[330px] lg:w-[420px]",
                imageClass: "min-h-[260px] lg:min-h-0 lg:object-[50%_center]",
              },
              {
                item: lifestyleGallery[2],
                className:
                  "lg:absolute lg:left-1/2 lg:top-[300px] lg:z-10 lg:h-[235px] lg:w-[235px] lg:-translate-x-1/2",
                imageClass: "min-h-[235px] lg:min-h-0 lg:object-[50%_center]",
              },
              {
                item: lifestyleGallery[1],
                className:
                  "lg:absolute lg:right-0 lg:top-[145px] lg:z-10 lg:h-[330px] lg:w-[420px]",
                imageClass: "min-h-[260px] lg:min-h-0 lg:object-[50%_center]",
              },
            ].map(({ item, className, imageClass }) => (
              <figure
                key={`${item.src}-${className}`}
                className={`group relative overflow-hidden border border-[#C2A878]/10 bg-[#183028]/72 shadow-[0_18px_46px_rgba(0,0,0,0.14)] ${className}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(min-width: 1024px) 440px, 100vw"
                  className={`h-full w-full object-cover opacity-92 transition duration-700 group-hover:scale-[1.014] group-hover:opacity-100 ${imageClass}`}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section
        id="inventory"
        className="mx-auto max-w-[1240px] px-6 py-20 sm:px-10 md:py-28 lg:px-12"
      >
        <div className="flex flex-col justify-between gap-6 pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F3EFE7]">
              Curated Collection
            </p>
            <h2 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.94] tracking-[-0.045em] text-[#F3EFE7] sm:text-6xl">
              Fewer cars. More consequence.
            </h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#8E8A83]">
              A limited presentation of investment-grade vehicles selected for specification,
              condition, story, and collector relevance.
            </p>
          </div>
          <Button
            variant="secondary"
            className="w-fit rounded-none border-[#C2A878]/34 bg-transparent text-[#F3EFE7] shadow-none hover:bg-white/6 hover:text-[#F3EFE7]"
            onClick={() => router.push("/cars")}
          >
            Browse all inventory
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {showcaseCars.slice(0, 3).map((car, index) => {
            const apiCar = cars[index];
            const detailsHref = apiCar ? `/cars/${apiCar.id}` : "/cars";

            return (
              <Card
                key={car.model}
                className="group overflow-hidden rounded-none border-0 bg-transparent shadow-none transition duration-500"
              >
                <Link href={detailsHref} className="block">
                  <div
                    className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${car.accent}`}
                  >
                    <Image
                      src={car.image}
                      alt={apiCar?.title || car.model}
                      fill
                      sizes="(min-width: 1024px) 390px, 100vw"
                      className="h-full w-full object-cover opacity-100 transition duration-700 group-hover:scale-[1.025]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(1,1,1,0.04)_0%,rgba(1,1,1,0.2)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(0deg,rgba(1,1,1,0.62),rgba(1,1,1,0))]" />
                    <div className="absolute bottom-4 left-4 bg-[#10211B]/54 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F3EFE7]/74 backdrop-blur-md">
                      {car.brand}
                    </div>
                  </div>
                </Link>
                <CardContent className="space-y-5 px-0 py-6">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#F3EFE7]">
                      {car.brand}
                    </p>
                    <Link href={detailsHref}>
                      <h3 className="font-heading text-2xl leading-[1.02] tracking-[-0.035em] text-[#F3EFE7] sm:text-3xl">
                        {car.model}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-[#8E8A83]">
                        {car.year} / {car.mileage}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8E8A83]/78">
                        {car.location}
                      </p>
                      <p className="mt-2 text-lg font-semibold text-[#F3EFE7]">{car.price}</p>
                    </div>
                    <Link
                      href={detailsHref}
                      className="pb-0.5 text-sm font-medium text-[#8E8A83] transition hover:text-[#F3EFE7]"
                    >
                      View Story →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <div className="text-[#F3EFE7]">
        <section id="sell" className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,9,0)_0%,rgba(16,33,27,0.18)_16%,rgba(16,33,27,0.42)_34%,rgba(24,48,40,0.72)_64%,#183028_100%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_38%,rgba(194,168,120,0.05),transparent_24%),radial-gradient(circle_at_22%_26%,rgba(243,239,231,0.025),transparent_22%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,9,0.06)_0%,rgba(16,33,27,0.05)_34%,rgba(24,48,40,0.08)_72%,rgba(24,48,40,0.14)_100%)]" />

          <div className="relative mx-auto grid min-h-[540px] max-w-[1440px] gap-10 px-6 pb-20 pt-12 sm:px-10 md:pb-24 md:pt-16 lg:grid-cols-[0.42fr_0.58fr] lg:items-center lg:px-12 xl:px-20">
            <div className="relative z-10 max-w-md lg:pl-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#C2A878]/88">
                Sell / Consign
              </p>
              <h2 className="mt-5 max-w-[9.5ch] font-heading text-4xl leading-[0.98] tracking-[-0.04em] text-[#F3EFE7] sm:text-5xl">
                Best SoFlo collection.
              </h2>
              <div className="mt-6 h-px w-14 bg-[#C2A878]/34" />
              <p className="mt-7 max-w-[31rem] text-sm leading-7 text-[#8E8A83]">
                Present your vehicle through a more discreet editorial process, with specialist
                valuation, tailored market positioning, and a buyer network shaped around
                collector-grade automobiles.
              </p>
              <Button
                variant="secondary"
                className="mt-8 h-9 rounded-none border-[#C2A878]/52 bg-transparent px-5 text-xs uppercase tracking-[0.2em] text-[#F3EFE7] shadow-none transition duration-300 hover:border-[#C2A878]/72 hover:bg-white/4 hover:text-[#F3EFE7]"
                onClick={() => router.push("/inquiry")}
              >
                Request Valuation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative min-h-[400px] lg:min-h-[520px]">
              <div className="absolute inset-x-0 bottom-0 top-6 overflow-hidden lg:top-8">
                <Image
                  src={sellImageUrl}
                  alt="Luxury Bentley-style motor car in a warm architectural showroom"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-full w-full object-cover object-[50%_center] opacity-[0.97]"
                />
              </div>
              <div className="absolute inset-y-0 left-0 w-14 bg-[linear-gradient(90deg,rgba(16,33,27,0.3)_0%,rgba(16,33,27,0.1)_48%,transparent_100%)]" />
              <div className="absolute inset-y-0 right-0 w-12 bg-[linear-gradient(270deg,rgba(16,33,27,0.22)_0%,rgba(16,33,27,0.08)_44%,transparent_100%)]" />
              <div className="absolute inset-x-0 top-0 h-10 bg-[linear-gradient(180deg,rgba(16,33,27,0.18)_0%,rgba(16,33,27,0.05)_42%,transparent_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(0deg,rgba(16,33,27,0.16)_0%,rgba(16,33,27,0.05)_42%,transparent_100%)]" />
            </div>
          </div>
        </section>

        <footer className="bg-[linear-gradient(180deg,#183028_0%,#10211B_100%)] text-[#F3EFE7]">
          <div className="mx-auto max-w-[1440px] px-6 pb-8 pt-12 sm:px-10 lg:px-12 xl:px-20">
            <div className="text-center">
              <Link href="/" aria-label="Trilogy Garage home" className="mx-auto inline-flex">
                <BrandLogo className="h-28 w-48" imageClassName="object-contain" />
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-8">
              {footerSocialLinks.map((item) => (
                <Link
                  key={item}
                  href="/"
                  aria-label={`Social link ${item}`}
                  className="flex h-5 min-w-5 items-center justify-center text-[11px] font-semibold uppercase tracking-[0.05em] text-[#8E8A83] transition hover:text-white"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="mt-12 border-t border-[#C2A878]/28 pt-10">
              <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                {footerColumns.map((column) => (
                  <div key={column.title}>
                    <h3 className="text-lg font-light tracking-[0.04em] text-[#F3EFE7]">
                      {column.title}
                    </h3>
                    <div className="mt-7 space-y-5">
                      {column.links.map((item) => (
                        <Link
                          key={item}
                          href="/cars"
                          className="flex items-center gap-3 text-[11px] leading-4 text-[#8E8A83] transition hover:text-[#F3EFE7]"
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

            <div className="mt-12 border-t border-[#C2A878]/28 pt-8">
              <div className="text-xs leading-6 text-[#8E8A83]">
                <p>© Copyright Trilogy Garage 2026</p>
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
