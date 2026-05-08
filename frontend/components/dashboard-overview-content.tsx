"use client";

import { MessageSquare, Plus, Upload, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardSummaryCard } from "@/components/dashboard-summary-card";
import { LoadingState } from "@/components/loading-state";
import { SectionHeading } from "@/components/section-heading";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getDashboardInquiries, getMyCars } from "@/lib/api";
import type { Car, Inquiry } from "@/lib/types";

const fallbackInventory = [
  {
    id: 1,
    title: "Bentley Flying Spur",
    dealer: "Bentley Minneapolis",
    price: "€280,000",
    mileage: "11,240 mi",
    image: "/luxury-gallery/hotel-arrival.png",
  },
  {
    id: 2,
    title: "Aston Martin DBX",
    dealer: "Prestige Motor Collection",
    price: "€210,000",
    mileage: "8,920 mi",
    image: "/luxury-gallery/private-showroom.png",
  },
  {
    id: 3,
    title: "Continental GT",
    dealer: "Motorflow Greenwich",
    price: "€245,000",
    mileage: "6,180 mi",
    image: "/homepage/luxury-generated-hero.png",
  },
];

const pipelineColumns = [
  {
    label: "New",
    inquiries: [
      ["Bentley Flying Spur", "James Richardson", "€280,000"],
      ["Rolls-Royce Ghost", "Sarah Al-Fayed", "€365,000"],
    ],
  },
  {
    label: "Contacted",
    inquiries: [
      ["Bentley Bentayga", "Marcus Chen", "€195,000"],
      ["Aston Martin DBX", "Isabella Rossi", "€210,000"],
    ],
  },
  {
    label: "Negotiating",
    inquiries: [
      ["Continental GT", "Alexander Volkov", "€245,000"],
      ["Phantom EWB", "Victoria Sterling", "€485,000"],
    ],
  },
  {
    label: "Closed",
    inquiries: [
      ["DB11 Volante", "Thomas Müller", "€215,000"],
      ["Mulsanne", "Catherine Laurent", "€325,000"],
    ],
  },
];

const quickActions = [
  {
    label: "Add Vehicle",
    href: "/dashboard/cars/new",
    icon: Plus,
  },
  {
    label: "Upload Images",
    href: "/dashboard/cars",
    icon: Upload,
  },
  {
    label: "View Inquiries",
    href: "/dashboard/inquiries",
    icon: MessageSquare,
  },
  {
    label: "Manage Dealers",
    href: "/dashboard",
    icon: Users,
  },
];

function formatDashboardPrice(price: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function DashboardOverviewContent() {
  const { user } = useAuthSession();
  const [cars, setCars] = useState<Car[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState("Loading dashboard...");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [carsData, inquiriesData] = await Promise.all([
          getMyCars(),
          getDashboardInquiries(),
        ]);
        setCars(carsData);
        setInquiries(inquiriesData);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load dashboard.");
      }
    }

    void loadDashboard();
  }, []);

  if (status) {
    return <LoadingState message={status} />;
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Operations Dashboard"
        description={
          user?.role === "admin"
            ? "Monitor all dealership inventory and customer demand from one premium control center."
            : "Track your dealership inventory and recent buyer activity in one place."
        }
        className="text-[#f1eadf]"
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <DashboardSummaryCard
          label="Total cars"
          value={cars.length}
          helper={user?.role === "admin" ? "All vehicle inventory across the platform." : "Vehicles assigned to your dealership."}
        />
        <DashboardSummaryCard
          label="Active inquiries"
          value={inquiries.length}
          helper={user?.role === "admin" ? "Every customer inquiry across all dealers." : "Inquiries tied to your inventory."}
        />
        <DashboardSummaryCard
          label="Vehicles sold"
          value={0}
          helper="Delivered sales reporting will appear here once sales tracking is enabled."
        />
        <DashboardSummaryCard
          label="Pending follow-ups"
          value={inquiries.length}
          helper="Open client conversations currently waiting on dealership response."
        />
      </div>

      <section className="border border-[#2b302b] bg-[#171916] p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#BFA46A]">Recent Inventory</p>
            <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-[#f1eadf]">
              Latest showroom additions
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#9fa496]">
            A quick view of the newest collector-grade opportunities in your inventory.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {(cars.length ? cars.slice(0, 3) : fallbackInventory).map((car) => {
            const fallback = fallbackInventory[0];
            const title = "title" in car ? car.title : fallback.title;
            const dealer = "dealer" in car && typeof car.dealer !== "string" ? car.dealer.name : "Prestige Motor Collection";
            const price = "price" in car ? formatDashboardPrice(car.price) : fallback.price;
            const mileage = "mileage" in car && typeof car.mileage === "number" ? `${car.mileage.toLocaleString()} mi` : fallback.mileage;
            const image = "main_image_url" in car ? car.main_image_url || fallback.image : car.image;

            return (
              <article key={car.id} className="group bg-[#10120f]">
                <div className="aspect-[16/10] overflow-hidden bg-[#26352F]">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover opacity-86 transition duration-700 group-hover:scale-[1.025] group-hover:opacity-100"
                  />
                </div>
                <div className="p-5">
                  <p className="text-base font-semibold text-[#f1eadf]">{title}</p>
                  <p className="mt-2 text-xs text-[#BFA46A]/72">{dealer}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-[#1d221d] pt-4">
                    <p className="font-heading text-xl text-[#f1eadf]">{price}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8f968c]">{mileage}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border border-[#2b302b] bg-[#171916] p-6 md:p-8">
        <h2 className="font-heading text-3xl tracking-[-0.03em] text-[#f1eadf]">
          Inquiry Pipeline
        </h2>

        <div className="mt-9 grid gap-5 xl:grid-cols-4">
          {pipelineColumns.map((column) => (
            <div key={column.label}>
              <div className="flex items-center justify-between border-b border-[#242824] pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#BFA46A]/72">
                  {column.label}
                </p>
                <span className="text-[10px] text-[#BFA46A]/72">{column.inquiries.length}</span>
              </div>

              <div className="mt-5 space-y-4">
                {column.inquiries.map(([vehicle, client, value]) => (
                  <article key={`${column.label}-${vehicle}`} className="bg-[#10120f] p-5">
                    <p className="text-sm font-semibold text-[#f1eadf]">{vehicle}</p>
                    <p className="mt-4 text-xs text-[#BFA46A]/68">{client}</p>
                    <div className="mt-4 border-t border-[#1d221d] pt-4">
                      <p className="font-heading text-base text-[#e8d7ae]">{value}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-2">
        <h2 className="font-heading text-3xl tracking-[-0.03em] text-[#f1eadf]">
          Quick Actions
        </h2>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex min-h-[84px] flex-col items-center justify-center border border-[#2b302b] bg-[#171916] px-4 text-center transition hover:border-[#BFA46A]/42 hover:bg-[#1a1d19]"
              >
                <Icon className="h-4 w-4 text-[#BFA46A]/72 transition group-hover:text-[#BFA46A]" strokeWidth={1.5} />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f1eadf]">
                  {action.label}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
