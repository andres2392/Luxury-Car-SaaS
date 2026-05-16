import { clearAuthSession, getStoredToken } from "@/lib/auth";
import { env } from "@/src/lib/env";

const API_BASE_URL = env.NEXT_PUBLIC_API_URL;

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
}

export function formatAPIErrorDetail(detail: unknown): string {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const record = item as { msg?: unknown; loc?: unknown };
          const message = typeof record.msg === "string" ? record.msg : JSON.stringify(item);
          const location = Array.isArray(record.loc)
            ? record.loc.filter((part) => part !== "body").join(".")
            : "";

          return location ? `${location}: ${message}` : message;
        }

        return String(item);
      })
      .join(" ");
  }

  if (detail && typeof detail === "object") {
    return JSON.stringify(detail);
  }

  return "";
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getStoredToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Something went wrong. Please try again.";

    try {
      const errorData = (await response.json()) as { detail?: unknown };
      const detail = formatAPIErrorDetail(errorData.detail);
      if (detail) {
        message = detail;
      }
    } catch {
      if (response.statusText) {
        message = response.statusText;
      }
    }

    if (options.auth && response.status === 401) {
      clearAuthSession();
      message = "Your session expired. Please log in again.";
    }

    throw new APIError(message, response.status);
  }

  return parseResponse<T>(response);
}

export function buildQueryString<T extends object>(params: T) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params) as Array<
    [string, string | number | undefined]
  >) {
    const normalizedValue = typeof value === "number" ? String(value) : value?.trim();

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export { API_BASE_URL };
