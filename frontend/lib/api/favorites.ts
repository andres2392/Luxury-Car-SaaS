import { apiRequest } from "@/lib/api/client";
import type { Car, FavoriteActionResponse } from "@/lib/types";

export function getFavorites() {
  return apiRequest<Car[]>("/favorites", {
    auth: true,
  });
}

export function saveFavorite(carId: number | string) {
  return apiRequest<FavoriteActionResponse>(`/favorites/${carId}`, {
    method: "POST",
    auth: true,
  });
}

export function removeFavorite(carId: number | string) {
  return apiRequest<FavoriteActionResponse>(`/favorites/${carId}`, {
    method: "DELETE",
    auth: true,
  });
}
