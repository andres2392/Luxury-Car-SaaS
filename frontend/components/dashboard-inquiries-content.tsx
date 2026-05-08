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
        className="text-[#f1eadf]"
      />

      {inquiries.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          description="When customers reach out from your inventory pages, their messages will appear here."
        />
      ) : (
        <div className="space-y-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="bg-[#1a1b18] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f968c]">
                    {inquiry.dealer_name ?? "Dealership"}
                  </p>
                  <h3 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-[#f1eadf]">
                    {inquiry.car_title ?? `Car #${inquiry.car_id}`}
                  </h3>
                </div>
                <p className="text-sm text-[#a7ab9f]">
                  {new Date(inquiry.created_at).toLocaleString()}
                </p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr]">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f968c]">Sender</p>
                  <p className="mt-2 text-sm font-medium text-[#f1eadf]">{inquiry.name}</p>
                  <p className="mt-1 text-sm text-[#a7ab9f]">{inquiry.email}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f968c]">Message</p>
                  <p className="mt-2 text-sm leading-7 text-[#d8d2c7]">{inquiry.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
