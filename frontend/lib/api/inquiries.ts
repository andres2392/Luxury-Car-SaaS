import { apiRequest } from "@/lib/api/client";
import type { Inquiry } from "@/lib/types";

export interface PublicInquiryPayload {
  car_id?: number | null;
  name: string;
  email: string;
  phone: string;
  location: string;
  inquiry_type: "buy" | "sell" | "sourcing" | "general";
  message: string;
  vehicle_of_interest?: string | null;
  budget_range?: string | null;
  preferred_contact_method?: "email" | "phone" | "text" | null;
  timeline?: "immediately" | "30_days" | "3_6_months" | "just_exploring" | null;
  company?: string;
}

export function createPublicInquiry(payload: PublicInquiryPayload) {
  return apiRequest<{ message: string }>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDashboardInquiries() {
  return apiRequest<Inquiry[]>("/inquiries", {
    auth: true,
  });
}

export function updateInquiryState(id: number | string, state: string) {
  return apiRequest<Inquiry>(`/inquiries/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
    auth: true,
  });
}

export function bulkUpdateInquiryState(ids: number[], state: string) {
  return apiRequest<{ updated: number; deleted: number }>("/inquiries/bulk-status", {
    method: "PATCH",
    body: JSON.stringify({ ids, state }),
    auth: true,
  });
}

export function deleteInquiry(id: number | string) {
  return apiRequest<void>(`/inquiries/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function bulkDeleteInquiries(ids: number[]) {
  return apiRequest<{ updated: number; deleted: number }>("/inquiries/bulk", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
    auth: true,
  });
}
