"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { SectionHeading } from "@/components/section-heading";
import { getDashboardInquiries } from "@/lib/api";
import type { Inquiry } from "@/lib/types";

export function DashboardInquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState("Loading inquiries...");

  useEffect(() => {
    async function loadInquiries() {
      try {
        const data = await getDashboardInquiries();
        setInquiries(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load inquiries.");
      }
    }

    void loadInquiries();
  }, []);

  if (status) {
    return <LoadingState message={status} />;
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Dashboard / Inquiries"
        title="Customer inquiries"
        description="Review the latest customer messages tied to your current role scope."
        className="text-white"
      />

      {inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          description="When customers reach out from your inventory pages, their messages will appear here."
        />
      ) : (
        <div className="space-y-4">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#7f8ea3]">
                    {inquiry.dealer_name ?? "Dealership"}
                  </p>
                  <h3 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-white">
                    {inquiry.car_title ?? `Car #${inquiry.car_id}`}
                  </h3>
                </div>
                <p className="text-sm text-[#8ea0b9]">
                  {new Date(inquiry.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#7f8ea3]">Sender</p>
                  <p className="mt-2 text-sm font-medium text-white">{inquiry.name}</p>
                  <p className="mt-1 text-sm text-[#8ea0b9]">{inquiry.email}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#7f8ea3]">Message</p>
                  <p className="mt-2 text-sm leading-7 text-[#d6dfeb]">{inquiry.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

