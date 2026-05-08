"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCar,
  deleteCarImage,
  getCarById,
  getDealers,
  setFeaturedCarImage,
  updateCar,
  uploadCarImages,
} from "@/lib/api";
import { canManageCars, isAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { Car, CarImage, Dealer } from "@/lib/types";

interface DashboardCarFormProps {
  mode: "create" | "edit";
  carId?: string;
}

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

const initialForm = {
  title: "",
  brand: "",
  model: "",
  year: "",
  price: "",
  mileage: "",
  description: "",
  dealer_id: "",
};

const brandOptions = [
  "Aston Martin",
  "Bentley",
  "Bugatti",
  "Ferrari",
  "Lamborghini",
  "Land Rover",
  "McLaren",
  "Mercedes-Maybach",
  "Porsche",
  "Rolls-Royce",
];

const allowedFileTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function DashboardCarForm({ mode, carId }: DashboardCarFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuthSession();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [form, setForm] = useState(initialForm);
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [featuredPendingId, setFeaturedPendingId] = useState<string | null>(null);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState(mode === "edit" ? "Loading car details..." : "");
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const canCreateOrEdit = useMemo(() => canManageCars(user), [user]);
  const isUserAdmin = useMemo(() => isAdmin(user), [user]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [pendingImages]);

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
          requests.push(refreshCarForm(carId));
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

  async function refreshCarForm(targetCarId: number | string) {
    const car: Car = await getCarById(targetCarId);
    setForm({
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      price: String(car.price),
      mileage: String(car.mileage),
      description: car.description ?? "",
      dealer_id: String(car.dealer_id),
    });
    setCarImages(car.images ?? []);
    setMainImageUrl(car.main_image_url);
  }

  function buildCarPayload() {
    return {
      title: form.title.trim(),
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      description: form.description.trim() || undefined,
      dealer_id: isUserAdmin ? Number(form.dealer_id) : undefined,
    };
  }

  function validateFiles(files: File[]) {
    const validFiles = files.filter((file) => allowedFileTypes.has(file.type));

    if (validFiles.length !== files.length) {
      setUploadError("Only jpg, jpeg, png, and webp image files are supported.");
    } else {
      setUploadError("");
    }

    return validFiles;
  }

  async function handleFilesSelected(selectedFiles: FileList | null) {
    if (!selectedFiles) {
      return;
    }

    const files = validateFiles(Array.from(selectedFiles));
    if (files.length === 0) {
      return;
    }

    if (mode === "edit" && carId) {
      await uploadImagesForExistingCar(files, carId);
      return;
    }

    const newPendingImages = files.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPendingImages((current) => [...current, ...newPendingImages]);
    setFeaturedPendingId((current) => current ?? newPendingImages[0]?.id ?? null);
  }

  async function uploadImagesForExistingCar(files: File[], targetCarId: number | string) {
    setUploadError("");
    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadCarImages(targetCarId, files, setUploadProgress);
      await refreshCarForm(targetCarId);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setUploadError("");
    setStatus("");

    if (!canCreateOrEdit) {
      setError("You do not have permission to manage cars.");
      return;
    }

    if (!form.title.trim() || !form.brand.trim() || !form.model.trim()) {
      setError("Please complete the required fields.");
      return;
    }

    if (!form.year || !form.price || !form.mileage) {
      setError("Please complete the year, price, and mileage fields.");
      return;
    }

    if (isUserAdmin && !form.dealer_id) {
      setError("Please choose a dealer for this listing.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildCarPayload();
      const savedCar =
        mode === "create"
          ? await createCar(payload)
          : await updateCar(carId ?? "", payload);

      const targetCarId = savedCar.id;

      if (pendingImages.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        const uploadedImages = await uploadCarImages(
          targetCarId,
          pendingImages.map((image) => image.file),
          setUploadProgress
        );

        const featuredIndex = featuredPendingId
          ? pendingImages.findIndex((image) => image.id === featuredPendingId)
          : 0;

        if (featuredIndex >= 0 && uploadedImages[featuredIndex]) {
          await setFeaturedCarImage(targetCarId, uploadedImages[featuredIndex].id);
        }

        pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
        setPendingImages([]);
        setFeaturedPendingId(null);
        setIsUploading(false);
      }

      router.push("/dashboard/cars");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the car.");
      setIsUploading(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveUploadedImage(image: CarImage) {
    if (!carId && mode === "create") {
      return;
    }

    try {
      await deleteCarImage(carId ?? "", image.id);
      await refreshCarForm(carId ?? "");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not remove the image.");
    }
  }

  async function handleSetFeaturedUploadedImage(image: CarImage) {
    if (!carId && mode === "create") {
      return;
    }

    try {
      const updatedCar = await setFeaturedCarImage(carId ?? "", image.id);
      setCarImages(updatedCar.images);
      setMainImageUrl(updatedCar.main_image_url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Could not set the featured image.");
    }
  }

  function handleRemovePendingImage(imageId: string) {
    setPendingImages((current) => {
      const image = current.find((item) => item.id === imageId);
      if (image) {
        URL.revokeObjectURL(image.previewUrl);
      }

      const nextImages = current.filter((item) => item.id !== imageId);
      if (featuredPendingId === imageId) {
        setFeaturedPendingId(nextImages[0]?.id ?? null);
      }
      return nextImages;
    });
  }

  if (status) {
    return (
      <div className="rounded-[1.1rem] border border-[#3a4038] bg-[#1e201d] p-6 text-sm text-[#a7ab9f]">
        {status}
      </div>
    );
  }

  return (
    <form id="dashboard-car-form" className="space-y-6 text-white" onSubmit={handleSubmit}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-[1.1rem] border border-[#3a4038] bg-[#1e201d] p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-white">
                Car name
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="h-12 rounded-xl border-[#3a4038] bg-[#171816] text-[#f1eadf] placeholder:text-[#8f968c] focus:border-[#f1eadf]"
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
                className="min-h-[240px] rounded-xl border-[#3a4038] bg-[#171816] text-[#f1eadf] placeholder:text-[#8f968c] focus:border-[#f1eadf]"
              />
            </div>
          </section>

          <section className="rounded-[1.1rem] border border-[#3a4038] bg-[#1e201d] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Images</h3>
                <p className="mt-1 text-sm text-[#a7ab9f]">
                  Upload gallery images directly from your device and choose one featured hero image.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  void handleFilesSelected(event.target.files);
                  event.target.value = "";
                }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  void handleFilesSelected(event.dataTransfer.files);
                }}
                className={cn(
                  "flex min-h-[210px] w-full flex-col items-center justify-center border border-dashed px-6 py-10 text-center transition",
                  isDragging
                    ? "border-[#f1eadf] bg-[#20211e]"
                    : "border-[#3a4038] bg-[#171816] hover:border-[#f1eadf]"
                )}
              >
                <p className="text-lg font-medium text-[#f1eadf]">Drop vehicle images here</p>
                <p className="mt-2 text-sm text-[#a7ab9f]">or click to browse files</p>
                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                  JPG, JPEG, PNG, WEBP
                </p>
              </button>
            </div>

            {isUploading ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-[#f1eadf]">
                  Uploading vehicle images... {uploadProgress}%
                </p>
                <div className="h-1.5 bg-[#171816]">
                  <div
                    className="h-full bg-[#f1eadf] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : null}

            {uploadError ? (
              <p className="mt-4 text-sm text-red-300">{uploadError}</p>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {carImages.map((image) => {
                const isFeatured = image.image_url === mainImageUrl;

                return (
                  <div key={image.id} className="overflow-hidden rounded-[1rem] border border-[#3a4038] bg-[#171816]">
                    <img
                      src={image.image_url}
                      alt="Vehicle upload preview"
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f968c]">
                        {isFeatured ? "Featured image" : "Gallery image"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 flex-1 rounded-[0.35rem] border border-[#4b4c43] bg-transparent text-xs text-[#f1eadf] hover:bg-[#262822]"
                          onClick={() => void handleSetFeaturedUploadedImage(image)}
                          disabled={isFeatured}
                        >
                          {isFeatured ? "Featured" : "Mark featured"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 flex-1 rounded-[0.35rem] border border-[#4b4c43] bg-transparent text-xs text-[#f1eadf] hover:bg-[#262822]"
                          onClick={() => void handleRemoveUploadedImage(image)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {pendingImages.map((image) => {
                const isFeatured = featuredPendingId === image.id;

                return (
                  <div key={image.id} className="overflow-hidden rounded-[1rem] border border-[#3a4038] bg-[#171816]">
                    <img
                      src={image.previewUrl}
                      alt="Pending vehicle upload"
                      className="aspect-[4/3] h-full w-full object-cover"
                    />
                    <div className="space-y-3 p-4">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8f968c]">
                        {isFeatured ? "Featured on save" : "Ready to upload"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 flex-1 rounded-[0.35rem] border border-[#4b4c43] bg-transparent text-xs text-[#f1eadf] hover:bg-[#262822]"
                          onClick={() => setFeaturedPendingId(image.id)}
                          disabled={isFeatured}
                        >
                          {isFeatured ? "Featured" : "Mark featured"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-9 flex-1 rounded-[0.35rem] border border-[#4b4c43] bg-transparent text-xs text-[#f1eadf] hover:bg-[#262822]"
                          onClick={() => handleRemovePendingImage(image.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {carImages.length === 0 && pendingImages.length === 0 ? (
                <div className="flex aspect-[4/3] items-center justify-center rounded-[1rem] border border-dashed border-[#3a4038] bg-[#171816] px-6 text-center text-sm text-[#a7ab9f]">
                  Upload previews will appear here once you drop or browse files.
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.1rem] border border-[#3a4038] bg-[#1e201d] p-5">
            <h3 className="text-lg font-semibold text-white">Organization</h3>
            <div className="mt-5 space-y-4">
              {isUserAdmin ? (
                <div className="space-y-2">
                  <Label htmlFor="dealer_id" className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                    Dealer
                  </Label>
                  <select
                    id="dealer_id"
                    value={form.dealer_id}
                    onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                    className={cn(
                      "flex h-11 w-full rounded-xl border border-[#3a4038] bg-[#171816] px-4 text-sm text-[#f1eadf] outline-none",
                      "focus:border-[#f1eadf]"
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
                  <Label className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                    Dealer
                  </Label>
                  <div className="flex h-11 items-center rounded-xl border border-[#3a4038] bg-[#171816] px-4 text-sm text-[#a7ab9f]">
                    Assigned from your dealer account
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="brand" className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                  Brand
                </Label>
                <select
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="flex h-11 w-full rounded-xl border border-[#3a4038] bg-[#171816] px-4 text-sm text-[#f1eadf] outline-none transition focus:border-[#f1eadf]"
                >
                  <option value="">Select brand</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                  Model
                </Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="h-11 rounded-xl border-[#3a4038] bg-[#171816] text-sm text-[#f1eadf] placeholder:text-[#8f968c] focus:border-[#f1eadf]"
                />
              </div>
            </div>
          </section>

          <section className="rounded-[1.1rem] border border-[#3a4038] bg-[#1e201d] p-5">
            <h3 className="text-lg font-semibold text-white">Pricing and specs</h3>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-11 rounded-xl border-[#3a4038] bg-[#171816] text-sm text-[#f1eadf] placeholder:text-[#8f968c] focus:border-[#f1eadf]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                    Year
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="h-11 rounded-xl border-[#3a4038] bg-[#171816] text-sm text-[#f1eadf] placeholder:text-[#8f968c] focus:border-[#f1eadf]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-xs uppercase tracking-[0.16em] text-[#8f968c]">
                    Mileage
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={form.mileage}
                    onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                    className="h-11 rounded-xl border-[#3a4038] bg-[#171816] text-sm text-[#f1eadf] placeholder:text-[#8f968c] focus:border-[#f1eadf]"
                  />
                </div>
              </div>
            </div>
          </section>

          {error ? (
            <section className="rounded-[1.1rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
              {error}
            </section>
          ) : null}
        </aside>
      </div>
    </form>
  );
}
