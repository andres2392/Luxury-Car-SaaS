"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DashboardSummaryCard } from "@/components/dashboard-summary-card";
import { LoadingState } from "@/components/loading-state";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getDashboardInquiries, getMyCars } from "@/lib/api";
import type { Car, Inquiry } from "@/lib/types";

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
        title="Welcome back"
        description={
          user?.role === "admin"
            ? "Monitor all dealership inventory and customer demand from one premium control center."
            : "Track your dealership inventory and recent buyer activity in one place."
        }
        className="text-white"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardSummaryCard
          label="Total cars"
          value={cars.length}
          helper={user?.role === "admin" ? "All vehicle inventory across the platform." : "Vehicles assigned to your dealership."}
        />
        <DashboardSummaryCard
          label="Total inquiries"
          value={inquiries.length}
          helper={user?.role === "admin" ? "Every customer inquiry across all dealers." : "Inquiries tied to your inventory."}
        />
        <DashboardSummaryCard
          label="Latest activity"
          value={inquiries[0] ? new Date(inquiries[0].created_at).toLocaleDateString() : "—"}
          helper="Newest inquiry activity visible in your current role scope."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
          <h3 className="font-heading text-3xl tracking-[-0.03em] text-white">Quick access</h3>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/cars">
              <Button>Manage cars</Button>
            </Link>
            <Link href="/dashboard/inquiries">
              <Button variant="secondary" className="border-white/10 bg-white/6 text-white hover:bg-white/10">
                View inquiries
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(135deg,#1d3fff_0%,#15224b_70%,#0d1117_100%)] p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-white/70">Role focus</p>
          <h3 className="mt-4 font-heading text-3xl tracking-[-0.03em] text-white">
            {user?.role === "admin" ? "Global control" : "Dealer operations"}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/80">
            {user?.role === "admin"
              ? "You can manage every car and review all inquiries across the marketplace."
              : "You can manage only your own dealership inventory and leads connected to it."}
          </p>
        </div>
      </div>
    </div>
  );
}

