"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCar } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth";
import type { Dealer, User } from "@/lib/types";

interface CreateCarPanelProps {
  dealers: Dealer[];
  onCreated: () => Promise<void>;
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

export function CreateCarPanel({ dealers, onCreated }: CreateCarPanelProps) {
  const [form, setForm] = useState(initialForm);
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const canCreate = user?.role === "admin" || user?.role === "dealer";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getStoredToken();

    if (!token) {
      setStatus("Please log in as a dealer or admin first.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      await createCar(
        {
          title: form.title,
          brand: form.brand,
          model: form.model,
          year: Number(form.year),
          price: Number(form.price),
          mileage: Number(form.mileage),
          description: form.description || undefined,
          main_image_url: form.main_image_url || undefined,
          dealer_id: Number(form.dealer_id),
          image_urls: form.image_urls
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        token
      );
      setForm(initialForm);
      setStatus("Car created successfully.");
      await onCreated();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create car.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Car</CardTitle>
        <CardDescription>
          Protected action for dealer/admin users. This uses the stored JWT token.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealer_id">Dealer</Label>
              <select
                id="dealer_id"
                value={form.dealer_id}
                onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                className="flex h-11 w-full rounded-full border border-[var(--color-border)] bg-white/85 px-4 text-sm text-[var(--color-foreground)] outline-none"
              >
                <option value="">Select dealer</option>
                {dealers.map((dealer) => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name}
                  </option>
                ))}
              </select>
            </div>
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
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {status ? <p className="text-sm text-[var(--color-muted-foreground)]">{status}</p> : null}

          <Button type="submit" disabled={!canCreate || isSubmitting}>
            {isSubmitting ? "Creating..." : canCreate ? "Create listing" : "Dealer or admin login required"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

