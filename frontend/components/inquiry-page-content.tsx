"use client";

import { ArrowRight, Globe2, Handshake, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { createPublicInquiry } from "@/lib/api";

const inquiryTypes = [
  { value: "buy", label: "I want to buy a vehicle" },
  { value: "sell", label: "I want to sell / consign a vehicle" },
  { value: "sourcing", label: "I need private sourcing" },
  { value: "general", label: "I have a general question" },
] as const;

const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "text", label: "Text" },
] as const;

const timelines = [
  { value: "immediately", label: "Immediately" },
  { value: "30_days", label: "30 days" },
  { value: "3_6_months", label: "3-6 months" },
  { value: "just_exploring", label: "Just exploring" },
] as const;

const conciergeCards = [
  {
    title: "Private Sourcing",
    copy: "Quiet searches through trusted owners, specialists, and closed-market relationships.",
    icon: Search,
  },
  {
    title: "Collector Advisory",
    copy: "Guidance on specification, provenance, condition, valuation, and long-term significance.",
    icon: ShieldCheck,
  },
  {
    title: "Consignment Support",
    copy: "Discreet presentation, buyer qualification, negotiation support, and handover planning.",
    icon: Handshake,
  },
  {
    title: "Worldwide Acquisition",
    copy: "Acquisition coordination across inspection, documentation, transport, and import needs.",
    icon: Globe2,
  },
];

type InquiryTypeValue = (typeof inquiryTypes)[number]["value"];
type ContactMethodValue = (typeof contactMethods)[number]["value"];
type TimelineValue = (typeof timelines)[number]["value"];

type InquiryFormState = {
  name: string;
  email: string;
  phone: string;
  location: string;
  inquiryType: InquiryTypeValue;
  vehicle: string;
  budget: string;
  message: string;
  contactMethod: ContactMethodValue;
  timeline: TimelineValue;
  company: string;
};

const allFieldNames = [
  "name",
  "email",
  "phone",
  "location",
  "inquiryType",
  "vehicle",
  "budget",
  "message",
] as const;

type FieldName = (typeof allFieldNames)[number];
type FormErrors = Partial<Record<FieldName, string>>;
type TouchedFields = Partial<Record<FieldName, boolean>>;
type SelectOption = { value: string; label: string };

const validInquiryTypes = new Set<string>(inquiryTypes.map((type) => type.value));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+().\-\s]{7,24}$/;
const unsafeTextPattern = /[<>]/;

const baseInputClass =
  "h-12 w-full rounded-none border bg-[#0D1411]/80 px-4 text-sm text-[#F3EFE7] outline-none transition placeholder:text-[#8E8A83]/70 focus:ring-2 focus:ring-[#C2A878]/12";

function trimForm(form: InquiryFormState): InquiryFormState {
  return {
    ...form,
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    location: form.location.trim(),
    vehicle: form.vehicle.trim(),
    budget: form.budget.trim(),
    message: form.message.trim(),
    company: form.company.trim(),
  };
}

function hasUnsafeText(value: string) {
  return unsafeTextPattern.test(value);
}

function validateForm(form: InquiryFormState): FormErrors {
  const values = trimForm(form);
  const errors: FormErrors = {};

  if (values.name.length < 2 || values.name.length > 80) {
    errors.name = "Enter a full name between 2 and 80 characters.";
  } else if (hasUnsafeText(values.name)) {
    errors.name = "HTML characters are not allowed.";
  }

  if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  const phoneDigits = values.phone.replace(/\D/g, "");
  if (!phonePattern.test(values.phone) || phoneDigits.length < 7 || phoneDigits.length > 20) {
    errors.phone = "Enter a valid phone number.";
  }

  if (values.location.length < 2 || values.location.length > 120) {
    errors.location = "Enter a location between 2 and 120 characters.";
  } else if (hasUnsafeText(values.location)) {
    errors.location = "HTML characters are not allowed.";
  }

  if (!validInquiryTypes.has(values.inquiryType)) {
    errors.inquiryType = "Select a valid inquiry type.";
  }

  if (values.vehicle.length > 120) {
    errors.vehicle = "Vehicle of interest must be 120 characters or fewer.";
  } else if (hasUnsafeText(values.vehicle)) {
    errors.vehicle = "HTML characters are not allowed.";
  }

  if (values.budget.length > 80) {
    errors.budget = "Budget range must be 80 characters or fewer.";
  } else if (hasUnsafeText(values.budget)) {
    errors.budget = "HTML characters are not allowed.";
  }

  if (values.message.length < 20 || values.message.length > 1000) {
    errors.message = "Enter a message between 20 and 1000 characters.";
  } else if (hasUnsafeText(values.message)) {
    errors.message = "HTML characters are not allowed.";
  }

  return errors;
}

export function InquiryPageContent() {
  const searchParams = useSearchParams();
  const initialVehicle = searchParams.get("vehicle") ?? "";
  const carIdParam = searchParams.get("car_id");
  const carId = carIdParam ? Number(carIdParam) : null;
  const linkedCarId = Number.isFinite(carId) ? carId : null;

  const [form, setForm] = useState<InquiryFormState>({
    name: "",
    email: "",
    phone: "",
    location: "",
    inquiryType: "buy",
    vehicle: initialVehicle,
    budget: "",
    message: "",
    contactMethod: "email",
    timeline: "just_exploring",
    company: "",
  });
  const [touched, setTouched] = useState<TouchedFields>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const errors = useMemo(() => validateForm(form), [form]);
  const isFormValid = Object.keys(errors).length === 0;

  function updateField(field: keyof InquiryFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setStatus((current) => (current === "success" ? "idle" : current));
  }

  function markTouched(field: FieldName) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") {
      return;
    }

    const sanitizedForm = trimForm(form);
    const nextErrors = validateForm(sanitizedForm);
    setForm(sanitizedForm);
    setTouched(Object.fromEntries(allFieldNames.map((field) => [field, true])) as TouchedFields);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("idle");
      setError("");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      await createPublicInquiry({
        car_id: linkedCarId,
        name: sanitizedForm.name,
        email: sanitizedForm.email,
        phone: sanitizedForm.phone,
        location: sanitizedForm.location,
        inquiry_type: sanitizedForm.inquiryType,
        message: sanitizedForm.message,
        vehicle_of_interest: sanitizedForm.vehicle || null,
        budget_range: sanitizedForm.budget || null,
        preferred_contact_method: sanitizedForm.contactMethod,
        timeline: sanitizedForm.timeline,
        company: sanitizedForm.company,
      });
      setStatus("success");
      setTouched({});
      setForm((current) => ({
        ...current,
        name: "",
        email: "",
        phone: "",
        location: "",
        vehicle: initialVehicle,
        budget: "",
        message: "",
        company: "",
      }));
    } catch {
      setStatus("error");
      setError("Unable to submit inquiry. Please review your details and try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#090909_0%,#10211B_42%,#090909_100%)] text-[#F3EFE7]">
      <section className="relative min-h-[68vh] overflow-hidden bg-[#090909]">
        <Image
          src="/images/services/sell-consign-lounge.webp"
          alt="Warm private collector lounge with architectural lighting"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 object-cover opacity-70 [filter:brightness(0.82)_contrast(1.06)_saturate(0.9)]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,9,0.96)_0%,rgba(9,9,9,0.82)_42%,rgba(9,9,9,0.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(194,168,120,0.14),transparent_34%)]" />

        <div className="relative mx-auto flex min-h-[68vh] max-w-[1440px] items-center px-6 py-20 sm:px-10 lg:px-12 xl:px-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#C2A878]">
              Private Collector Desk
            </p>
            <h1 className="mt-6 font-heading text-4xl leading-[0.96] tracking-[-0.045em] text-[#F3EFE7] sm:text-6xl lg:text-[5.2rem]">
              Begin a Private Conversation
            </h1>
            <div className="mt-7 h-px w-16 bg-[#C2A878]/52" />
            <p className="mt-7 max-w-xl text-sm leading-7 text-[#C8C2B7]">
              Whether you are searching for a collector-grade automobile, considering a private
              sale, or requesting discreet sourcing support, our team will respond with tailored
              guidance.
            </p>
            <a
              href="#start-inquiry"
              className="mt-9 inline-flex h-11 w-full items-center justify-center gap-3 border border-[#C2A878]/45 bg-[#C2A878]/10 px-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#F3EFE7] transition hover:border-[#C2A878]/70 hover:bg-[#C2A878]/18 sm:w-auto"
            >
              Start Inquiry
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </section>

      <section id="start-inquiry" className="px-6 py-20 sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.78fr_1.22fr]">
          <aside>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#C2A878]/80">
              Concierge Intent
            </p>
            <h2 className="mt-4 font-heading text-4xl leading-none tracking-[-0.035em] text-[#F3EFE7]">
              Select the conversation you would like to begin.
            </h2>
            <div className="mt-8 grid gap-3">
              {inquiryTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onBlur={() => markTouched("inquiryType")}
                  onClick={() => updateField("inquiryType", type.value)}
                  className={`border px-5 py-4 text-left text-sm transition ${
                    form.inquiryType === type.value
                      ? "border-[#C2A878]/70 bg-[#C2A878]/12 text-[#F3EFE7]"
                      : "border-white/10 bg-[#0D1411]/62 text-[#C8C2B7] hover:border-[#C2A878]/36 hover:text-[#F3EFE7]"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {touched.inquiryType && errors.inquiryType ? (
              <p className="mt-3 text-xs text-[#F0C8BF]">{errors.inquiryType}</p>
            ) : null}
          </aside>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="min-w-0 border border-[#C2A878]/20 bg-[#070A09]/78 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.32)] backdrop-blur-md sm:p-8"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full name"
                value={form.name}
                onBlur={() => markTouched("name")}
                onChange={(value) => updateField("name", value)}
                error={touched.name ? errors.name : undefined}
                required
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onBlur={() => markTouched("email")}
                onChange={(value) => updateField("email", value)}
                error={touched.email ? errors.email : undefined}
                required
              />
              <Field
                label="Phone"
                value={form.phone}
                onBlur={() => markTouched("phone")}
                onChange={(value) => updateField("phone", value)}
                error={touched.phone ? errors.phone : undefined}
                required
              />
              <Field
                label="Location"
                value={form.location}
                onBlur={() => markTouched("location")}
                onChange={(value) => updateField("location", value)}
                error={touched.location ? errors.location : undefined}
                required
              />
              <SelectField
                label="Inquiry type"
                value={form.inquiryType}
                options={inquiryTypes}
                onBlur={() => markTouched("inquiryType")}
                onChange={(value) => updateField("inquiryType", value as InquiryTypeValue)}
                error={touched.inquiryType ? errors.inquiryType : undefined}
                required
              />
              <Field
                label="Vehicle of interest"
                value={form.vehicle}
                onBlur={() => markTouched("vehicle")}
                onChange={(value) => updateField("vehicle", value)}
                error={touched.vehicle ? errors.vehicle : undefined}
                placeholder="Model, collection, or open brief"
              />
              <Field
                label="Budget range"
                value={form.budget}
                onBlur={() => markTouched("budget")}
                onChange={(value) => updateField("budget", value)}
                error={touched.budget ? errors.budget : undefined}
                placeholder="Optional"
              />
              <SelectField
                label="Preferred contact method"
                value={form.contactMethod}
                options={contactMethods}
                onChange={(value) => updateField("contactMethod", value as ContactMethodValue)}
              />
              <SelectField
                label="Timeline"
                value={form.timeline}
                options={timelines}
                onChange={(value) => updateField("timeline", value as TimelineValue)}
                className="md:col-span-2"
              />
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />
              <label className="md:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
                  Message <span className="text-[#F0C8BF]">*</span>
                </span>
                <textarea
                  value={form.message}
                  onBlur={() => markTouched("message")}
                  onChange={(event) => updateField("message", event.target.value)}
                  required
                  minLength={20}
                  maxLength={1000}
                  rows={7}
                  placeholder="Share the vehicle, collection goal, provenance questions, or sale context you would like us to understand."
                  aria-invalid={Boolean(touched.message && errors.message)}
                  className={`mt-3 min-h-40 w-full rounded-none border bg-[#0D1411]/80 px-4 py-3 text-sm leading-7 text-[#F3EFE7] outline-none transition placeholder:text-[#8E8A83]/70 focus:ring-2 focus:ring-[#C2A878]/12 ${
                    touched.message && errors.message
                      ? "border-[#8F4E42]/70"
                      : "border-[#C2A878]/24 focus:border-[#C2A878]/70"
                  }`}
                />
                {touched.message && errors.message ? (
                  <span className="mt-2 block text-xs text-[#F0C8BF]">{errors.message}</span>
                ) : (
                  <span className="mt-2 block text-xs text-[#8E8A83]">
                    {form.message.trim().length}/1000 characters
                  </span>
                )}
              </label>
            </div>

            {status === "success" ? (
              <p className="mt-6 border border-[#C2A878]/28 bg-[#C2A878]/10 px-4 py-3 text-sm text-[#F3EFE7]">
                Your inquiry has been received. A specialist will contact you shortly.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="mt-6 border border-[#8F4E42]/50 bg-[#2A100D]/70 px-4 py-3 text-sm text-[#F0C8BF]">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              disabled={!isFormValid || status === "loading"}
              className="mt-7 h-12 w-full rounded-none border border-[#C2A878]/48 bg-[#C2A878]/12 px-7 text-[10px] uppercase tracking-[0.28em] text-[#F3EFE7] shadow-none hover:bg-[#C2A878]/20 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
            >
              {status === "loading" ? "Submitting..." : "Submit Private Inquiry"}
            </Button>
          </form>
        </div>
      </section>

      <section className="px-6 pb-24 sm:px-10 lg:px-12">
        <div className="mx-auto grid max-w-[1240px] gap-4 md:grid-cols-2 xl:grid-cols-4">
          {conciergeCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="border border-white/10 bg-[#0D1411]/70 p-6">
                <Icon className="h-5 w-5 text-[#C2A878]" strokeWidth={1.5} />
                <h3 className="mt-7 font-heading text-2xl tracking-[-0.02em] text-[#F3EFE7]">
                  {card.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-[#8E8A83]">{card.copy}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label>
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
        {label} {required ? <span className="text-[#F0C8BF]">*</span> : null}
      </span>
      <input
        type={type}
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`${baseInputClass} mt-3 ${
          error ? "border-[#8F4E42]/70" : "border-[#C2A878]/24 focus:border-[#C2A878]/70"
        }`}
      />
      {error ? <span className="mt-2 block text-xs text-[#F0C8BF]">{error}</span> : null}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  onBlur,
  className = "",
  required = false,
  error,
}: {
  label: string;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className={className}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#C2A878]/78">
        {label} {required ? <span className="text-[#F0C8BF]">*</span> : null}
      </span>
      <select
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={`${baseInputClass} mt-3 appearance-none ${
          error ? "border-[#8F4E42]/70" : "border-[#C2A878]/24 focus:border-[#C2A878]/70"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0D1411] text-[#F3EFE7]">
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-2 block text-xs text-[#F0C8BF]">{error}</span> : null}
    </label>
  );
}
