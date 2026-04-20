import { apiRequest } from "@/lib/api/client";
import type { Inquiry } from "@/lib/types";

export function createInquiry(payload: {
  car_id: number;
  name: string;
  email: string;
  message: string;
}) {
  return apiRequest<Inquiry>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export function getDashboardInquiries() {
  return apiRequest<Inquiry[]>("/inquiries", {
    auth: true,
  });
}
