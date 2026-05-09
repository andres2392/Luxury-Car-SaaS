export type UserRole = "admin" | "dealer";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Dealer {
  id: number;
  name: string;
  description: string | null;
  contact_email: string;
  created_at: string;
}

export interface Car {
  id: number;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: string;
  mileage: number;
  description: string | null;
  main_image_url: string | null;
  dealer_id: number;
  created_at: string;
  image_urls: string[];
  images: CarImage[];
  dealer: Dealer;
}

export interface CarImage {
  id: number;
  car_id: number;
  image_url: string;
  created_at: string;
}

export interface Inquiry {
  id: number;
  car_id: number;
  user_id: number | null;
  name: string;
  email: string;
  message: string;
  state: string;
  created_at: string;
  car_title?: string | null;
  dealer_name?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CarFilters {
  brand?: string;
  min_price?: string;
  max_price?: string;
  year?: string;
}

export interface CarPayload {
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  description?: string;
  main_image_url?: string;
  dealer_id?: number;
  image_urls?: string[];
}
