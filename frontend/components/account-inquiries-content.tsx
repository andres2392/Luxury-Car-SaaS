"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { getMyInquiries } from "@/lib/api";
import type { Inquiry } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AccountInquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [status, setStatus] = useState("Loading your inquiries...");

  useEffect(() => {
    async function loadInquiries() {
      try {
        const data = await getMyInquiries();
        setInquiries(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load your inquiries.");
      }
    }

    void loadInquiries();
  }, []);

  if (status) {
    return <LoadingState message={status} />;
  }

  if (inquiries.length === 0) {
    return (
      <EmptyState
        title="You haven’t submitted any inquiries yet"
        description="Once you contact a dealer while signed in, your message history will appear here."
        actionLabel="Explore cars"
        actionHref="/cars"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#7f8ea3]">My Inquiries</p>
        <h1 className="mt-2 font-heading text-5xl tracking-[-0.05em] text-white">Conversation history</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-[#8ea0b9]">
          Review the messages you’ve already sent to dealers and keep your follow-up organized.
        </p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <article
            key={inquiry.id}
            className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#7f8ea3]">
                  {inquiry.car_title ?? "Vehicle inquiry"}
                </p>
                <p className="mt-3 text-base leading-7 text-white">{inquiry.message}</p>
              </div>
              <div className="text-sm text-[#8ea0b9] md:text-right">
                <p>{inquiry.email}</p>
                <p className="mt-1">{formatDate(inquiry.created_at)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
