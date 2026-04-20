import { apiRequest } from "@/lib/api/client";
import type { Dealer } from "@/lib/types";

export function getDealers() {
  return apiRequest<Dealer[]>("/dealers");
}

