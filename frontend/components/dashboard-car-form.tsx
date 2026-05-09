"use client";

import { ImageIcon, Star, UploadCloud } from "lucide-react";
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

  const imageCount = carImages.length + pendingImages.length;

  return (
    <form id="dashboard-car-form" className="text-white" onSubmit={handleSubmit}>
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

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_430px] xl:items-start">
        <main className="space-y-5">
          <section className="border border-white/6 bg-[#151916]/74 p-6 sm:p-7">
            <div className="flex items-end justify-between gap-6 border-b border-white/8 pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
                  Vehicle Information
                </p>
                <h3 className="mt-2 font-heading text-3xl leading-tight tracking-[-0.035em] text-[#f3efe7]">
                  Core identity
                </h3>
              </div>
              <p className="hidden max-w-[16rem] text-right text-xs leading-5 text-[#8f968c] sm:block">
                Name the car like a collector listing, not a database record.
              </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f968c]">
                  Car name
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="1994 Ferrari 512 TR"
                  className="h-12 rounded-none border-0 border-b border-white/12 bg-transparent px-0 text-lg text-[#f1eadf] shadow-none placeholder:text-[#4f574f] focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f968c]">
                  Model
                </Label>
                <Input
                  id="model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="512 TR"
                  className="h-12 rounded-none border-0 border-b border-white/12 bg-transparent px-0 text-lg text-[#f1eadf] shadow-none placeholder:text-[#4f574f] focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>
            </div>
          </section>

          <section className="border border-white/6 bg-[#151916]/58 p-6 sm:p-7">
            <div className="border-b border-white/8 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
                Presentation
              </p>
              <h3 className="mt-2 font-heading text-3xl leading-tight tracking-[-0.035em] text-[#f3efe7]">
                Editorial story
              </h3>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="description" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f968c]">
                Description
              </Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe provenance, specification, condition, and the emotional character of the vehicle."
                className="min-h-[150px] rounded-none border border-white/10 bg-[#101310]/82 p-4 text-sm leading-7 text-[#f1eadf] shadow-none placeholder:text-[#5e665d] focus:border-[#C2A878] focus-visible:ring-0"
              />
            </div>
          </section>

          <section className="border border-white/6 bg-[#151916]/50 p-6 sm:p-7">
            <div className="border-b border-white/8 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
                Specifications
              </p>
              <h3 className="mt-2 font-heading text-3xl leading-tight tracking-[-0.035em] text-[#f3efe7]">
                Collector facts
              </h3>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f968c]">
                  Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="h-11 rounded-none border-0 border-b border-white/12 bg-transparent px-0 text-[#f1eadf] shadow-none focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mileage" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f968c]">
                  Mileage
                </Label>
                <Input
                  id="mileage"
                  type="number"
                  value={form.mileage}
                  onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                  className="h-11 rounded-none border-0 border-b border-white/12 bg-transparent px-0 text-[#f1eadf] shadow-none focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f968c]">
                  Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="h-11 rounded-none border-0 border-b border-white/12 bg-transparent px-0 text-[#f1eadf] shadow-none focus:border-[#C2A878] focus-visible:ring-0"
                />
              </div>
            </div>
          </section>
        </main>

        <aside className="xl:sticky xl:top-24">
          <div className="space-y-5 border border-white/8 bg-[#101310]/92 p-5 backdrop-blur-xl">
            <section className="border-b border-white/8 pb-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
                    Publishing
                  </p>
                  <h3 className="mt-2 font-heading text-2xl tracking-[-0.03em] text-[#f3efe7]">
                    Listing control
                  </h3>
                </div>
                <Button
                  type="submit"
                  className="h-10 rounded-none border border-[#C2A878]/36 bg-transparent px-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f3efe7] shadow-none hover:bg-white/[0.05]"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting ? "Saving..." : mode === "create" ? "Publish" : "Save"}
                </Button>
              </div>
              {error ? (
                <p className="mt-4 border border-red-400/18 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
            </section>

            <section className="border-b border-white/8 pb-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8f968c]">
                Organization
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                {isUserAdmin ? (
                  <div className="space-y-2">
                    <Label htmlFor="dealer_id" className="text-[10px] uppercase tracking-[0.2em] text-[#8f968c]">
                      Dealer
                    </Label>
                    <select
                      id="dealer_id"
                      value={form.dealer_id}
                      onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                      className="flex h-10 w-full border border-white/10 bg-[#151916] px-3 text-sm text-[#f1eadf] outline-none transition focus:border-[#C2A878]"
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
                    <Label className="text-[10px] uppercase tracking-[0.2em] text-[#8f968c]">
                      Dealer
                    </Label>
                    <div className="flex h-10 items-center border border-white/10 bg-[#151916] px-3 text-sm text-[#a7ab9f]">
                      Assigned from your dealer account
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-[10px] uppercase tracking-[0.2em] text-[#8f968c]">
                    Brand
                  </Label>
                  <select
                    id="brand"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    className="flex h-10 w-full border border-white/10 bg-[#151916] px-3 text-sm text-[#f1eadf] outline-none transition focus:border-[#C2A878]"
                  >
                    <option value="">Select brand</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8f968c]">
                    Media Gallery
                  </p>
                  <p className="mt-1 text-sm text-[#f3efe7]">
                    {imageCount ? `${imageCount} image${imageCount === 1 ? "" : "s"} curated` : "No images yet"}
                  </p>
                </div>
                <ImageIcon className="h-5 w-5 text-[#C2A878]/70" strokeWidth={1.4} />
              </div>

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
                  "mt-4 flex min-h-[150px] w-full flex-col items-center justify-center border border-dashed px-5 py-7 text-center transition",
                  isDragging
                    ? "border-[#C2A878] bg-[#1a211d]"
                    : "border-white/14 bg-[#151916] hover:border-[#C2A878]/70 hover:bg-[#171d19]"
                )}
              >
                <UploadCloud className="h-7 w-7 text-[#C2A878]/76" strokeWidth={1.35} />
                <p className="mt-4 text-sm font-medium text-[#f1eadf]">Curate vehicle photography</p>
                <p className="mt-2 max-w-[15rem] text-xs leading-5 text-[#8f968c]">
                  Drop images here or browse. Hero, details, provenance, and interior moments.
                </p>
              </button>

              {isUploading ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#f1eadf]">
                    Uploading {uploadProgress}%
                  </p>
                  <div className="h-1 bg-white/8">
                    <div
                      className="h-full bg-[#C2A878] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {uploadError ? (
                <p className="mt-4 text-sm text-red-300">{uploadError}</p>
              ) : null}

              <div className="mt-5 grid gap-3">
                {carImages.map((image) => {
                  const isFeatured = image.image_url === mainImageUrl;

                  return (
                    <div key={image.id} className="group overflow-hidden border border-white/8 bg-[#151916]">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={image.image_url}
                          alt="Vehicle upload preview"
                          className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                        />
                        {isFeatured ? (
                          <div className="absolute left-3 top-3 inline-flex items-center gap-2 bg-[#101310]/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f3efe7] backdrop-blur-md">
                            <Star className="h-3 w-3 text-[#C2A878]" fill="currentColor" />
                            Featured
                          </div>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 border-t border-white/8 text-[10px] uppercase tracking-[0.16em]">
                        <button
                          type="button"
                          className="border-r border-white/8 px-3 py-3 text-[#f1eadf] transition hover:bg-white/[0.04] disabled:text-[#8f968c]"
                          onClick={() => void handleSetFeaturedUploadedImage(image)}
                          disabled={isFeatured}
                        >
                          {isFeatured ? "Selected" : "Feature"}
                        </button>
                        <button
                          type="button"
                          className="px-3 py-3 text-[#d7b4a8] transition hover:bg-white/[0.04]"
                          onClick={() => void handleRemoveUploadedImage(image)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {pendingImages.map((image) => {
                  const isFeatured = featuredPendingId === image.id;

                  return (
                    <div key={image.id} className="group overflow-hidden border border-white/8 bg-[#151916]">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={image.previewUrl}
                          alt="Pending vehicle upload"
                          className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-100"
                        />
                        <div className="absolute left-3 top-3 inline-flex items-center gap-2 bg-[#101310]/80 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#f3efe7] backdrop-blur-md">
                          <Star className="h-3 w-3 text-[#C2A878]" fill={isFeatured ? "currentColor" : "none"} />
                          {isFeatured ? "Featured on save" : "Pending"}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-t border-white/8 text-[10px] uppercase tracking-[0.16em]">
                        <button
                          type="button"
                          className="border-r border-white/8 px-3 py-3 text-[#f1eadf] transition hover:bg-white/[0.04] disabled:text-[#8f968c]"
                          onClick={() => setFeaturedPendingId(image.id)}
                          disabled={isFeatured}
                        >
                          {isFeatured ? "Selected" : "Feature"}
                        </button>
                        <button
                          type="button"
                          className="px-3 py-3 text-[#d7b4a8] transition hover:bg-white/[0.04]"
                          onClick={() => handleRemovePendingImage(image.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}

                {imageCount === 0 ? (
                  <div className="flex aspect-[16/10] items-center justify-center border border-dashed border-white/10 bg-[#151916] px-6 text-center text-sm leading-6 text-[#8f968c]">
                    Gallery previews will appear here as a cinematic listing sequence.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </form>
  );
}
