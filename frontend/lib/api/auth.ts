import { apiRequest } from "@/lib/api/client";
import type { AuthResponse } from "@/lib/types";

export function signupUser(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

