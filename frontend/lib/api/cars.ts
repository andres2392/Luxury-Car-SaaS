import { getStoredToken } from "@/lib/auth";
import { API_BASE_URL, APIError, apiRequest, buildQueryString } from "@/lib/api/client";
import type { Car, CarFilters, CarImage, CarPayload } from "@/lib/types";

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

export function updateCar(id: number | string, payload: Partial<CarPayload>) {
  return apiRequest<Car>(`/cars/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    auth: true,
  });
}

export function deleteCar(id: number | string) {
  return apiRequest<void>(`/cars/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getMyCars() {
  return apiRequest<Car[]>("/cars/mine", {
    auth: true,
  });
}

export function uploadCarImages(
  carId: number | string,
  files: File[],
  onProgress?: (progress: number) => void
) {
  return new Promise<CarImage[]>((resolve, reject) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const request = new XMLHttpRequest();
    request.open("POST", `${API_BASE_URL}/cars/${carId}/images`);
    request.responseType = "json";

    const token = getStoredToken();
    if (token) {
      request.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    request.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) {
        return;
      }
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    request.onload = () => {
      const response = request.response as CarImage[] | { detail?: string } | null;
      if (request.status >= 200 && request.status < 300 && Array.isArray(response)) {
        resolve(response);
        return;
      }

      const message =
        response && !Array.isArray(response) && response.detail
          ? response.detail
          : "Image upload failed.";
      reject(new APIError(message, request.status || 500));
    };

    request.onerror = () => {
      reject(new APIError("Image upload failed.", request.status || 500));
    };

    request.send(formData);
  });
}

export function deleteCarImage(carId: number | string, imageId: number | string) {
  return apiRequest<void>(`/cars/${carId}/images/${imageId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function setFeaturedCarImage(carId: number | string, imageId: number | string) {
  return apiRequest<Car>(`/cars/${carId}/images/${imageId}/featured`, {
    method: "PATCH",
    auth: true,
  });
}
