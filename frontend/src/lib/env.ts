const fallbackApiUrl = "http://localhost:8000";

function requiredPublicUrl(name: string, fallback?: string) {
  const rawValue = process.env[name] ?? fallback;

  if (!rawValue) {
    throw new Error(`${name} is required.`);
  }

  try {
    return new URL(rawValue).toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be a valid URL.`);
  }
}

export const env = {
  NEXT_PUBLIC_API_URL: requiredPublicUrl("NEXT_PUBLIC_API_URL", fallbackApiUrl),
} as const;
