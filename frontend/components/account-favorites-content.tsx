"use client";

import { useEffect, useState } from "react";

import { CarCard } from "@/components/car-card";
import { EmptyState } from "@/components/empty-state";
import { FavoriteButton } from "@/components/favorite-button";
import { LoadingState } from "@/components/loading-state";
import { getFavorites } from "@/lib/api";
import type { Car } from "@/lib/types";

export function AccountFavoritesContent() {
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [status, setStatus] = useState("Loading saved cars...");

  useEffect(() => {
    async function loadFavorites() {
      try {
        const data = await getFavorites();
        setFavorites(data);
        setStatus("");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load saved cars.");
      }
    }

    void loadFavorites();
  }, []);

  if (status) {
    return <LoadingState message={status} />;
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="You haven’t saved any cars yet"
        description="Use the save action on the marketplace to build a shortlist of vehicles you want to revisit."
        actionLabel="Browse cars"
        actionHref="/cars"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#7f8ea3]">Saved Cars</p>
        <h1 className="mt-2 font-heading text-5xl tracking-[-0.05em] text-white">Your shortlist</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-[#8ea0b9]">
          Compare the cars you saved and jump back into the detail pages whenever you’re ready.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {favorites.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            action={
              <FavoriteButton
                carId={car.id}
                isSaved
                onChange={(nextValue) => {
                  if (!nextValue) {
                    setFavorites((current) => current.filter((favorite) => favorite.id !== car.id));
                  }
                }}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
