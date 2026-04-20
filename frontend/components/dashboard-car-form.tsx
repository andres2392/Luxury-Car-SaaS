"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCar, getCarById, getDealers, updateCar } from "@/lib/api";
import { canManageCars, isAdmin } from "@/lib/auth";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { Car, Dealer } from "@/lib/types";

interface DashboardCarFormProps {
  mode: "create" | "edit";
  carId?: string;
}

const initialForm = {
  title: "",
  brand: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  description: "",
  main_image_url: "",
  dealer_id: "",
  image_urls: "",
};

export function DashboardCarForm({ mode, carId }: DashboardCarFormProps) {
  const router = useRouter();
  const { user } = useAuthSession();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(mode === "edit" ? "Loading car details..." : "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canCreateOrEdit = useMemo(() => canManageCars(user), [user]);
  const isUserAdmin = useMemo(() => isAdmin(user), [user]);

  useEffect(() => {
    async function loadFormData() {
      try {
        const requests: Promise<unknown>[] = [];

        if (isUserAdmin) {
          requests.push(
            getDealers().then((data) => {
              setDealers(data);
            })
          );
        }

        if (mode === "edit" && carId) {
          requests.push(
            getCarById(carId).then((car: Car) => {
              setForm({
                title: car.title,
                brand: car.brand,
                model: car.model,
                year: String(car.year),
                price: String(car.price),
                mileage: String(car.mileage),
                description: car.description ?? "",
                main_image_url: car.main_image_url ?? "",
                dealer_id: String(car.dealer_id),
                image_urls: car.image_urls.join(", "),
              });
            })
          );
        }

        await Promise.all(requests);
        setStatus("");
      } catch (err) {
        setStatus("");
        setError(err instanceof Error ? err.message : "Could not load car form.");
      }
    }

    void loadFormData();
  }, [carId, isUserAdmin, mode]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!canCreateOrEdit) {
      setError("You do not have permission to manage cars.");
      return;
    }

    if (!form.title.trim() || !form.brand.trim() || !form.model.trim()) {
      setError("Please complete the required fields.");
      return;
    }

    if (isUserAdmin && !form.dealer_id) {
      setError("Please choose a dealer for this listing.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: form.title,
      brand: form.brand,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      description: form.description || undefined,
      main_image_url: form.main_image_url || undefined,
      dealer_id: isUserAdmin ? Number(form.dealer_id) : undefined,
      image_urls: form.image_urls
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      if (mode === "create") {
        await createCar(payload);
      } else if (carId) {
        await updateCar(carId, payload);
      }

      router.push("/dashboard/cars");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the car.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status) {
    return (
      <Card className="border-white/8 bg-white/[0.04] text-white">
        <CardContent className="p-6 text-sm text-[#8ea0b9]">{status}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/8 bg-white/[0.04] text-white">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create listing" : "Edit listing"}</CardTitle>
        <CardDescription className="text-[#8ea0b9]">
          {mode === "create"
            ? "Add a new luxury car to the dealership inventory."
            : "Update the vehicle details and keep the listing current."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            {isUserAdmin ? (
              <div className="space-y-2">
                <Label htmlFor="dealer_id">Dealer</Label>
                <select
                  id="dealer_id"
                  value={form.dealer_id}
                  onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                  className="flex h-11 w-full rounded-full border border-white/10 bg-[#111722] px-4 text-sm text-white outline-none"
                >
                  <option value="">Select dealer</option>
                  {dealers.map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Dealer</Label>
                <div className="flex h-11 items-center rounded-full border border-white/10 bg-[#111722] px-4 text-sm text-[#8ea0b9]">
                  Assigned from your dealer account
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input id="mileage" type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="main_image_url">Main image URL</Label>
              <Input
                id="main_image_url"
                value={form.main_image_url}
                onChange={(e) => setForm({ ...form, main_image_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_urls">Gallery image URLs</Label>
            <Input
              id="image_urls"
              value={form.image_urls}
              onChange={(e) => setForm({ ...form, image_urls: e.target.value })}
              placeholder="Comma-separated URLs"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create car" : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

