import { apiRequest } from "@/lib/api/client";
import type { Inquiry } from "@/lib/types";

export function getDashboardInquiries() {
  return apiRequest<Inquiry[]>("/inquiries", {
    auth: true,
  });
}

export function updateInquiryState(id: number | string, state: string) {
  return apiRequest<Inquiry>(`/inquiries/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
    auth: true,
  });
}
