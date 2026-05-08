export type InventoryCar = {
  id: number;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  bodyType: string;
  exteriorColor: string;
  interiorColor: string;
  fuelType: string;
  location: string;
  dealer: string;
  description: string;
  certified?: boolean;
  image: string;
  thumbnails: string[];
  photoCount: number;
};

export const inventoryCars: InventoryCar[] = [
  {
    id: 1,
    title: "2022 Ferrari F8 Tributo",
    make: "Ferrari",
    model: "F8 Tributo",
    year: 2022,
    price: 389500,
    mileage: 8420,
    bodyType: "Coupe",
    exteriorColor: "Rosso Corsa",
    interiorColor: "Nero",
    fuelType: "Petrol",
    location: "Miami, FL",
    dealer: "Prestige Motor Collection Miami",
    description: "Rosso Corsa with Nero interior",
    certified: true,
    image: "/homepage/bentley-inspired-hero.png",
    thumbnails: [
      "/homepage/bentley-inspired-hero.png",
      "/luxury-gallery/detail-atelier.png",
      "/luxury-gallery/private-showroom.png",
    ],
    photoCount: 28,
  },
  {
    id: 2,
    title: "2021 Lamborghini Huracan EVO",
    make: "Lamborghini",
    model: "Huracan EVO",
    year: 2021,
    price: 327800,
    mileage: 6180,
    bodyType: "Coupe",
    exteriorColor: "Verde Mantis",
    interiorColor: "Nero Ade",
    fuelType: "Petrol",
    location: "Los Angeles, CA",
    dealer: "West Coast Performance Los Angeles",
    description: "Verde Mantis with Nero Ade interior",
    image: "/luxury-gallery/hotel-arrival.png",
    thumbnails: [
      "/luxury-gallery/hotel-arrival.png",
      "/luxury-gallery/detail-atelier.png",
      "/homepage/luxury-generated-hero.png",
    ],
    photoCount: 24,
  },
  {
    id: 3,
    title: "2020 McLaren 720S Spider",
    make: "McLaren",
    model: "720S Spider",
    year: 2020,
    price: 301200,
    mileage: 9300,
    bodyType: "Convertible",
    exteriorColor: "Onyx Black",
    interiorColor: "Carbon Black",
    fuelType: "Petrol",
    location: "Greenwich, CT",
    dealer: "Atelier Automotive Greenwich",
    description: "Onyx Black with Carbon Black interior",
    image: "/luxury-gallery/private-showroom.png",
    thumbnails: [
      "/luxury-gallery/private-showroom.png",
      "/luxury-gallery/mountain-coupe.png",
      "/luxury-gallery/detail-atelier.png",
    ],
    photoCount: 31,
  },
  {
    id: 4,
    title: "2023 Porsche 911 Turbo S",
    make: "Porsche",
    model: "911 Turbo S",
    year: 2023,
    price: 284900,
    mileage: 4870,
    bodyType: "Coupe",
    exteriorColor: "Chalk",
    interiorColor: "Bordeaux Red",
    fuelType: "Petrol",
    location: "Beverly Hills, CA",
    dealer: "Bespoke Performance Beverly Hills",
    description: "Chalk with Bordeaux Red interior",
    certified: true,
    image: "/luxury-gallery/mountain-coupe.png",
    thumbnails: [
      "/luxury-gallery/mountain-coupe.png",
      "/luxury-gallery/detail-atelier.png",
      "/luxury-gallery/private-showroom.png",
    ],
    photoCount: 22,
  },
  {
    id: 5,
    title: "2022 Rolls-Royce Ghost",
    make: "Rolls-Royce",
    model: "Ghost",
    year: 2022,
    price: 372400,
    mileage: 12200,
    bodyType: "Sedan",
    exteriorColor: "Arctic White",
    interiorColor: "Moccasin",
    fuelType: "Petrol",
    location: "Palm Beach, FL",
    dealer: "Palm House Motor Cars",
    description: "Arctic White with Moccasin interior",
    image: "/homepage/certified-showroom.png",
    thumbnails: [
      "/homepage/certified-showroom.png",
      "/luxury-gallery/hotel-arrival.png",
      "/luxury-gallery/detail-atelier.png",
    ],
    photoCount: 26,
  },
  {
    id: 6,
    title: "2021 Aston Martin DBS Superleggera",
    make: "Aston Martin",
    model: "DBS Superleggera",
    year: 2021,
    price: 259800,
    mileage: 7600,
    bodyType: "Coupe",
    exteriorColor: "Magnetic Silver",
    interiorColor: "Obsidian Black",
    fuelType: "Petrol",
    location: "New York, NY",
    dealer: "Chelsea Motor Gallery",
    description: "Magnetic Silver with Obsidian Black interior",
    image: "/homepage/luxury-generated-hero.png",
    thumbnails: [
      "/homepage/luxury-generated-hero.png",
      "/luxury-gallery/detail-atelier.png",
      "/luxury-gallery/private-showroom.png",
    ],
    photoCount: 19,
  },
];

export function getInventoryCarById(id: number) {
  return inventoryCars.find((car) => car.id === id) ?? inventoryCars[0];
}

export function formatInventoryPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatInventoryMileage(mileage: number) {
  return `${mileage.toLocaleString()} mi`;
}
