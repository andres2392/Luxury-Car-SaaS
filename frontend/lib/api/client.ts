import { getStoredToken } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class APIError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "APIError";
    this.status = status;
  }
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
      const errorData = (await response.json()) as { detail?: string };
      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      if (response.statusText) {
        message = response.statusText;
      }
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
    const normalizedValue =
      typeof value === "number" ? String(value) : value?.trim();

    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export { API_BASE_URL };
