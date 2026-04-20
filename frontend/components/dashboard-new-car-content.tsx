"use client";

import { useEffect, useState } from "react";

import { CreateCarPanel } from "@/components/create-car-panel";
import { LoadingState } from "@/components/loading-state";
import { getDealers } from "@/lib/api";
import type { Dealer } from "@/lib/types";

export function DashboardNewCarContent() {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [status, setStatus] = useState("Loading dealers...");

  useEffect(() => {
    async function loadDealers() {
      try {
        const data = await getDealers();
        setDealers(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load dealers.");
      }
    }

    void loadDealers();
  }, []);

  if (status) {
    return <LoadingState message={status} />;
  }

  return <CreateCarPanel dealers={dealers} />;
}

