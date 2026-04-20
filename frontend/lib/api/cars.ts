import { apiRequest, buildQueryString } from "@/lib/api/client";
import type { Car, CarFilters, CarPayload } from "@/lib/types";

export function getCars(filters: CarFilters = {}) {
  return apiRequest<Car[]>(`/cars${buildQueryString(filters)}`);
}

export function getCarById(id: string | number) {
  return apiRequest<Car>(`/cars/${id}`);
}

export function createCar(payload: CarPayload) {
  return apiRequest<Car>("/cars", {
    method: "POST",
    body: JSON.stringify(payload),
    auth: true,
  });
}

