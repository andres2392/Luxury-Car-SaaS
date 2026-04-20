import type {
  AuthResponse,
  Car,
  CarFilters,
  CarPayload,
  Dealer,
  Inquiry,
  UserRole,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const errorData = (await response.json()) as { detail?: string };
      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      message = response.statusText || message;
    }

    throw new APIError(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function listCars(filters: CarFilters = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return request<Car[]>(`/cars${query ? `?${query}` : ""}`);
}

export function getCar(id: string | number) {
  return request<Car>(`/cars/${id}`);
}

export function listDealers() {
  return request<Dealer[]>("/dealers");
}

export function signup(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createInquiry(payload: {
  car_id: number;
  name: string;
  email: string;
  message: string;
}, token?: string | null) {
  return request<Inquiry>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}

export function createCar(payload: CarPayload, token: string) {
  return request<Car>("/cars", {
    method: "POST",
    body: JSON.stringify(payload),
    token,
  });
}
