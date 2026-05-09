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
    title: "Ferrari 512 TR",
    dealer: "Private Collection Miami",
    price: "$389,500",
    mileage: "8,420 mi",
    image: "/collector/analog-icons-garage.png",
  },
  {
    id: 2,
    title: "Porsche Carrera GT",
    dealer: "Motorflow Newport",
    price: "$1,275,000",
    mileage: "6,180 mi",
    image: "/collector/carrera-gt-gallery.png",
  },
  {
    id: 3,
    title: "Defender 110 Heritage",
    dealer: "Motorflow Greenwich",
    price: "$168,000",
    mileage: "31,400 mi",
    image: "/collector/heritage-defender-gallery.png",
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
            ? "Monitor all dealership inventory and active lead flow from one premium control center."
            : "Track your dealership inventory and recent buyer activity in one place."
        }
        className="text-[#F3EFE7]"
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
          helper={user?.role === "admin" ? "Every inbound inquiry across all dealers." : "Inquiries tied to your inventory."}
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

      <section className="border border-white/6 bg-white/[0.03] p-6 backdrop-blur-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#C2A878]">Recent Inventory</p>
            <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-[#F3EFE7]">
              Latest showroom additions
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#8E8A83]">
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
              <article key={car.id} className="group border border-white/6 bg-[#0f1412]/72">
                <div className="aspect-[16/10] overflow-hidden bg-[#183028]">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover opacity-86 transition duration-700 group-hover:scale-[1.025] group-hover:opacity-100"
                  />
                </div>
                <div className="p-5">
                  <p className="text-base font-semibold text-[#F3EFE7]">{title}</p>
                  <p className="mt-2 text-xs text-[#C2A878]/72">{dealer}</p>
                  <div className="mt-5 flex items-end justify-between border-t border-white/6 pt-4">
                    <p className="font-heading text-xl text-[#F3EFE7]">{price}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8A83]">{mileage}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border border-white/6 bg-white/[0.03] p-6 backdrop-blur-sm md:p-8">
        <h2 className="font-heading text-3xl tracking-[-0.03em] text-[#F3EFE7]">
          Inquiry Pipeline
        </h2>

        <div className="mt-9 grid gap-5 xl:grid-cols-4">
          {pipelineColumns.map((column) => (
            <div key={column.label}>
              <div className="flex items-center justify-between border-b border-white/6 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C2A878]/72">
                  {column.label}
                </p>
                <span className="text-[10px] text-[#C2A878]/72">{column.inquiries.length}</span>
              </div>

              <div className="mt-5 space-y-4">
                {column.inquiries.map(([vehicle, client, value]) => (
                  <article key={`${column.label}-${vehicle}`} className="border border-white/6 bg-[#0f1412]/72 p-5">
                    <p className="text-sm font-semibold text-[#F3EFE7]">{vehicle}</p>
                    <p className="mt-4 text-xs text-[#C2A878]/68">{client}</p>
                    <div className="mt-4 border-t border-white/6 pt-4">
                      <p className="font-heading text-base text-[#F3EFE7]">{value}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pt-2">
        <h2 className="font-heading text-3xl tracking-[-0.03em] text-[#F3EFE7]">
          Quick Actions
        </h2>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.label}
                href={action.href}
                className="group flex min-h-[84px] flex-col items-center justify-center border border-white/6 bg-white/[0.03] px-4 text-center transition hover:border-[#C2A878]/28 hover:bg-white/[0.05]"
              >
                <Icon className="h-4 w-4 text-[#C2A878]/72 transition group-hover:text-[#C2A878]" strokeWidth={1.5} />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#F3EFE7]">
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
