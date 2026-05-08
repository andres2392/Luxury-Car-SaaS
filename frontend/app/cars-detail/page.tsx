import Link from "next/link";
import {
  Bookmark,
  Camera,
  ChevronLeft,
  Printer,
  Shuffle,
} from "lucide-react";

import {
  formatInventoryMileage,
  formatInventoryPrice,
  getInventoryCarById,
} from "@/lib/mock-inventory";

export default async function CarsDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ car?: string }>;
}) {
  const params = await searchParams;
  const carId = Number(params.car ?? "1");
  const car = getInventoryCarById(Number.isNaN(carId) ? 1 : carId);
  const gallery = [
    ...car.thumbnails.filter((image) => !image.includes("/homepage/")),
    car.image,
    ...car.thumbnails,
    "/luxury-gallery/detail-atelier.png",
    "/luxury-gallery/private-showroom.png",
    "/luxury-gallery/mountain-coupe.png",
    "/luxury-gallery/hotel-arrival.png",
  ].filter((image, index, images) => images.indexOf(image) === index);

  const specs = [
    ["Fuel Type", car.fuelType],
    ["Engine", car.make === "Ferrari" ? "3.9L V8" : "Grand touring powertrain"],
    ["Driver Position", "LHD"],
    ["Odometer", formatInventoryMileage(car.mileage)],
    ["Transmission", "Automatic"],
    ["Body Style", car.bodyType],
    ["Model Year", String(car.year)],
    ["Registration Date", `04.${car.year}`],
    ["Exterior", car.exteriorColor],
    ["Interior", car.interiorColor],
  ];

  return (
    <main className="min-h-screen bg-[#FEFDFC] text-[#171717]">
      <section className="px-5 pb-2 pt-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1540px]">
          <Link
            href="/cars"
            className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#6E6A63] transition duration-300 hover:text-[#B79F73]"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            Back
          </Link>
        </div>
      </section>

      <section className="bg-[#FEFDFC] px-5 pb-5 pt-2 sm:px-8 sm:pb-6 sm:pt-3 lg:px-12">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-2 bg-[#FEFDFC] lg:grid-cols-[1.15fr_0.85fr]">
            <figure className="relative min-h-[250px] overflow-hidden bg-[#EFE9DF] lg:h-[440px]">
              <img
                src={gallery[0]}
                alt={car.title}
                className="h-full w-full object-cover brightness-[1.04] saturate-[0.96]"
              />
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-3 border border-[#D8D0C4] bg-[#FEFDFC]/88 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6E6A63] backdrop-blur-sm">
                <Camera className="h-4 w-4" strokeWidth={1.5} />
                {car.photoCount} photos
              </div>
            </figure>

            <div className="grid grid-cols-2 gap-2 lg:h-[440px] lg:grid-rows-2">
              {gallery.slice(1, 5).map((image, index) => (
                <figure key={`${car.id}-gallery-${index}`} className="group aspect-square overflow-hidden bg-[#EFE9DF] lg:aspect-auto lg:h-full">
                  <img
                    src={image}
                    alt={`${car.title} supporting image ${index + 1}`}
                    className="h-full w-full object-cover brightness-[1.03] saturate-[0.96] transition duration-700 ease-out group-hover:scale-[1.035]"
                  />
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 pt-2 text-center sm:px-8 sm:pb-12 sm:pt-3 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mx-auto max-w-4xl text-4xl font-light leading-[1.08] tracking-[0.02em] text-[#171717] sm:text-5xl lg:text-[3.7rem]">
            {car.title}
          </h1>
          <p className="mt-5 text-3xl font-light leading-tight tracking-[0.02em] text-[#171717] sm:text-[2rem]">
            {formatInventoryPrice(car.price)}
          </p>
          <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.34em] text-[#171717]">
            {car.dealer}
          </p>
          <p className="mt-3 text-sm tracking-[0.08em] text-[#6E6A63]">{car.location}</p>
        </div>
      </section>

      <section className="px-5 pb-16 text-center sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-stretch justify-center gap-3 sm:flex-row sm:gap-4">
          <button className="inline-flex h-11 items-center justify-center border border-[#34483F] bg-[#34483F] px-9 text-[10px] font-semibold uppercase tracking-[0.3em] text-white transition duration-300 hover:bg-[#25362F]">
            Enquire to Buy
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 border border-[#34483F] bg-transparent px-9 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#34483F] transition duration-300 hover:bg-[#F5F2EC]">
            <Bookmark className="h-4 w-4" strokeWidth={1.5} />
            Save
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 border border-[#34483F] bg-transparent px-9 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#34483F] transition duration-300 hover:bg-[#F5F2EC]">
            <Shuffle className="h-4 w-4" strokeWidth={1.5} />
            Compare
          </button>
          <button className="inline-flex h-11 items-center justify-center gap-2 border border-[#34483F] bg-transparent px-9 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#34483F] transition duration-300 hover:bg-[#F5F2EC]">
            <Printer className="h-4 w-4" strokeWidth={1.5} />
            Print
          </button>
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
        </div>
      </section>
    </main>
  );
}
