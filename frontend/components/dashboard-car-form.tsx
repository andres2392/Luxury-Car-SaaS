"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCar, getCarById, getDealers, updateCar } from "@/lib/api";
import { canManageCars, isAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
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
  const galleryImages = useMemo(
    () =>
      form.image_urls
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.image_urls]
  );

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
      <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6 text-sm text-[#8ea0b9]">
        {status}
      </div>
    );
  }

  return (
    <form id="dashboard-car-form" className="space-y-6 text-white" onSubmit={handleSubmit}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-white">
                Car name
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-12 rounded-2xl border-white/10 bg-[#111722] text-white"
              />
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-[240px] rounded-[1.5rem] border-white/10 bg-[#111722] text-white placeholder:text-[#6b7b92]"
              />
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Images</h3>
                <p className="mt-1 text-sm text-[#8ea0b9]">
                  Add the hero image first, then any gallery links below it.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="main_image_url" className="text-sm font-medium text-white">
                  Main image URL
                </Label>
                <Input
                  id="main_image_url"
                  value={form.main_image_url}
                  onChange={(e) => setForm({ ...form, main_image_url: e.target.value })}
                  className="h-12 rounded-2xl border-white/10 bg-[#111722] text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_urls" className="text-sm font-medium text-white">
                  Gallery image links
                </Label>
                <Textarea
                  id="image_urls"
                  value={form.image_urls}
                  onChange={(e) => setForm({ ...form, image_urls: e.target.value })}
                  placeholder="Paste comma-separated URLs"
                  className="min-h-[120px] rounded-[1.5rem] border-white/10 bg-[#111722] text-white placeholder:text-[#6b7b92]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {form.main_image_url ? (
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111722]">
                    <img
                      src={form.main_image_url}
                      alt="Main listing preview"
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                  </div>
                ) : null}

                {galleryImages.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#111722]"
                  >
                    <img
                      src={imageUrl}
                      alt="Gallery preview"
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                  </div>
                ))}

                {!form.main_image_url && galleryImages.length === 0 ? (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-[#111722] px-6 text-center text-sm text-[#8ea0b9]">
                    Image previews will appear here once you add URLs.
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5">
            <h3 className="text-lg font-semibold text-white">Organization</h3>
            <div className="mt-5 space-y-4">
              {isUserAdmin ? (
                <div className="space-y-2">
                  <Label htmlFor="dealer_id" className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                    Dealer
                  </Label>
                  <select
                    id="dealer_id"
                    value={form.dealer_id}
                    onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                    className={cn(
                      "flex h-11 w-full rounded-2xl border border-white/10 bg-[#111722] px-4 text-sm text-white outline-none",
                      "focus:border-[#1d3fff]"
                    )}
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
                  <Label className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                    Dealer
                  </Label>
                  <div className="flex h-11 items-center rounded-2xl border border-white/10 bg-[#111722] px-4 text-sm text-[#8ea0b9]">
                    Assigned from your dealer account
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                  Brand
                </Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="h-11 rounded-2xl border-white/10 bg-[#111722] text-sm text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                  Model
                </Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="h-11 rounded-2xl border-white/10 bg-[#111722] text-sm text-white"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5">
            <h3 className="text-lg font-semibold text-white">Pricing and specs</h3>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-11 rounded-2xl border-white/10 bg-[#111722] text-sm text-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                    Year
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="h-11 rounded-2xl border-white/10 bg-[#111722] text-sm text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-xs uppercase tracking-[0.16em] text-[#7f8ea3]">
                    Mileage
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={form.mileage}
                    onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                    className="h-11 rounded-2xl border-white/10 bg-[#111722] text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <section className="rounded-[1.75rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
              {error}
            </section>
          ) : null}

        </aside>
      </div>
    </form>
  );
}
