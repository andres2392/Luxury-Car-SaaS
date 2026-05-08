"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AccountSummaryCard } from "@/components/account-summary-card";
import { LoadingState } from "@/components/loading-state";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { getFavorites, getMyInquiries } from "@/lib/api";

export function AccountOverviewContent() {
  const { user } = useAuthSession();
  const [status, setStatus] = useState("Loading account overview...");
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [inquiryCount, setInquiryCount] = useState(0);

  useEffect(() => {
    async function loadOverview() {
      try {
        const [favorites, inquiries] = await Promise.all([getFavorites(), getMyInquiries()]);
        setFavoriteCount(favorites.length);
        setInquiryCount(inquiries.length);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load your account.");
      }
    }

    void loadOverview();
  }, []);

  if (status) {
    return <LoadingState message={status} />;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.22em] text-[#7f8ea3]">Account overview</p>
        <h1 className="font-heading text-5xl tracking-[-0.05em] text-white">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-[#8ea0b9]">
          Keep track of the cars you love and the dealer conversations you have already started.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <AccountSummaryCard
          label="Saved cars"
          value={favoriteCount}
          helper="Your luxury shortlist is ready whenever you want to compare cars again."
        />
        <AccountSummaryCard
          label="My inquiries"
          value={inquiryCount}
          helper="Review the conversations you started with dealers and follow up from the same account."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/account/favorites">
          <Button>View saved cars</Button>
        </Link>
        <Link href="/account/inquiries">
          <Button variant="secondary" className="border-white/10 bg-white/6 text-white hover:bg-white/10">
            View my inquiries
          </Button>
        </Link>
      </div>
    </div>
  );
}
