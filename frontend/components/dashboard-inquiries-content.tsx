"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  Mail,
  Phone,
  Star,
  UserPlus,
} from "lucide-react";

import { LoadingState } from "@/components/loading-state";
import { getCarById, getDashboardInquiries, updateInquiryState } from "@/lib/api";
import type { Car, Inquiry } from "@/lib/types";

type InquiryStage = "new" | "contacted" | "negotiating" | "reserved" | "sold" | "archived";
type WorkspaceInquiry = Inquiry & {
  lastActivity?: string;
  tags?: string[];
  notes?: string;
};
type VehicleContext = {
  title: string;
  price: string | null;
  year: number | null;
  mileage: number | null;
  image: string;
  dealer: string;
  metadata: string[];
};

const stages: Array<{ key: InquiryStage; label: string }> = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "negotiating", label: "Negotiating" },
  { key: "reserved", label: "Reserved" },
  { key: "sold", label: "Sold" },
  { key: "archived", label: "Archived" },
];

const fallbackImage = "/images/gallery/analog-detail.webp";

function normalizeStage(state: string | null | undefined): InquiryStage {
  const normalized = (state ?? "new").toLowerCase();
  return stages.some((stage) => stage.key === normalized) ? (normalized as InquiryStage) : "new";
}

function formatPrice(price: string | null | undefined) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Private";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numericPrice);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isVip(inquiry: WorkspaceInquiry) {
  return inquiry.tags?.includes("VIP") || inquiry.id % 3 === 0;
}

function vehicleFromCar(inquiry: WorkspaceInquiry, car: Car | undefined): VehicleContext {
  if (car) {
    return {
      title: car.title,
      price: car.price,
      year: car.year,
      mileage: car.mileage,
      image: car.main_image_url ?? fallbackImage,
      dealer: car.dealer.name,
      metadata: [car.brand, car.model, "Active inventory"],
    };
  }

  return {
    title: inquiry.car_title ?? `Vehicle #${inquiry.car_id}`,
    price: null,
    year: null,
    mileage: null,
    image: fallbackImage,
    dealer: inquiry.dealer_name ?? "Dealership",
    metadata: ["Inventory lookup pending", "Collector inquiry", "Concierge review"],
  };
}

export function DashboardInquiriesContent() {
  const [inquiries, setInquiries] = useState<WorkspaceInquiry[]>([]);
  const [carsById, setCarsById] = useState<Record<number, Car>>({});
  const [selectedInquiryId, setSelectedInquiryId] = useState<number | null>(null);
  const [status, setStatus] = useState("Loading inquiries...");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInquiries() {
      try {
        const data = await getDashboardInquiries();
        setInquiries(data);
        setSelectedInquiryId(data[0]?.id ?? null);
        const uniqueCarIds = [...new Set(data.map((inquiry) => inquiry.car_id))];
        const carEntries = await Promise.all(
          uniqueCarIds.map(async (carId) => {
            try {
              const car = await getCarById(carId);
              return [carId, car] as const;
            } catch {
              return null;
            }
          })
        );
        setCarsById(Object.fromEntries(carEntries.filter((entry) => entry !== null)));
        setStatus("");
      } catch (loadError) {
        setStatus(loadError instanceof Error ? loadError.message : "Could not load inquiries.");
      }
    }

    void loadInquiries();
  }, []);

  const groupedInquiries = useMemo(() => {
    return stages.map((stage) => ({
      ...stage,
      inquiries: inquiries.filter((inquiry) => normalizeStage(inquiry.state) === stage.key),
    }));
  }, [inquiries]);

  const selectedInquiry =
    inquiries.find((inquiry) => inquiry.id === selectedInquiryId) ?? inquiries[0];

  async function handleStageChange(nextStage: string) {
    if (!selectedInquiry) {
      return;
    }

    setError("");

    setInquiries((current) =>
      current.map((inquiry) =>
        inquiry.id === selectedInquiry.id ? { ...inquiry, state: nextStage } : inquiry
      )
    );

    try {
      const updatedInquiry = await updateInquiryState(selectedInquiry.id, nextStage);
      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry.id === updatedInquiry.id ? updatedInquiry : inquiry
        )
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update inquiry status.");
    }
  }

  if (status) {
    return <LoadingState message={status} />;
  }

  return (
    <div className="text-[#f3efe7]">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#C2A878]/76">
            Dashboard / Inquiries
          </p>
          <h1 className="mt-2 font-heading text-4xl leading-[0.98] tracking-[-0.045em]">
            Private client desk
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8E8A83]">
            Collector intent, vehicle context, and concierge next steps in one operational workspace.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-right">
          <Metric label="Open" value={inquiries.length.toString()} />
          <Metric label="VIP" value={inquiries.filter(isVip).length.toString()} />
          <Metric label="Reserved" value={inquiries.filter((inquiry) => normalizeStage(inquiry.state) === "reserved").length.toString()} />
        </div>
      </div>

      {error ? (
        <div className="mb-4 border border-[#C2A878]/24 bg-[#C2A878]/8 px-4 py-3 text-sm text-[#f3efe7]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="max-h-[calc(100vh-210px)] overflow-y-auto border border-white/6 bg-[#151713]/72 p-3">
          <div className="space-y-4">
            {groupedInquiries.map((group) => (
              <section key={group.key}>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f3efe7]">
                    {group.label}
                  </h2>
                  <span className="text-[10px] text-[#C2A878]/70">{group.inquiries.length}</span>
                </div>

                <div className="space-y-2">
                  {group.inquiries.length === 0 ? (
                    <div className="px-2 py-2 text-[11px] text-[#6F756D]">Quiet</div>
                  ) : null}
                  {group.inquiries.map((inquiry) => {
                    const vehicle = vehicleFromCar(inquiry, carsById[inquiry.car_id]);

                    return (
                      <button
                        key={inquiry.id}
                        type="button"
                        onClick={() => setSelectedInquiryId(inquiry.id)}
                        className={`group w-full border px-2.5 py-2 text-left transition ${
                          selectedInquiry?.id === inquiry.id
                            ? "border-[#C2A878]/38 bg-[#C2A878]/10"
                            : "border-white/6 bg-white/[0.022] hover:border-[#C2A878]/22 hover:bg-white/[0.045]"
                        }`}
                      >
                        <div className="flex gap-2.5">
                          <img
                            src={vehicle.image}
                            alt={vehicle.title}
                            className="h-14 w-16 shrink-0 object-cover opacity-90"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-[#f3efe7]">{inquiry.name}</p>
                              {isVip(inquiry) ? (
                                <span className="text-[9px] uppercase tracking-[0.12em] text-[#C2A878]">VIP</span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-[#8E8A83]">{vehicle.title}</p>
                            <div className="mt-2 flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.12em] text-[#8E8A83]">
                              <span>{inquiry.lastActivity ?? "New activity"}</span>
                              <span>{formatPrice(vehicle.price)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-[#6F756D]">
                          <span>{formatDateTime(inquiry.created_at)}</span>
                          <span className="text-[#C2A878]/72">{group.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </aside>

        {selectedInquiry ? (
          <InquiryWorkspace
            inquiry={selectedInquiry}
            vehicle={vehicleFromCar(selectedInquiry, carsById[selectedInquiry.car_id])}
            onStageChange={handleStageChange}
          />
        ) : (
          <section className="flex min-h-[360px] items-center justify-center border border-white/6 bg-[#151713]/72 p-8 text-center">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C2A878]/78">
                No Inquiries
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#8E8A83]">
                New vehicle inquiries will appear here after clients submit the public contact form.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function InquiryWorkspace({
  inquiry,
  vehicle,
  onStageChange,
}: {
  inquiry: WorkspaceInquiry;
  vehicle: VehicleContext;
  onStageChange: (stage: string) => void;
}) {
  const activeStage = normalizeStage(inquiry.state);
  const timeline = [
    ["Inquiry submitted", formatDateTime(inquiry.created_at), true],
    ["Contacted", inquiry.lastActivity ?? "Concierge outreach pending", ["contacted", "negotiating", "reserved", "sold"].includes(activeStage)],
    ["Call scheduled", "Private appointment desk", ["negotiating", "reserved", "sold"].includes(activeStage)],
    ["Negotiation started", "Terms and client intent logged", ["negotiating", "reserved", "sold"].includes(activeStage)],
    ["Deposit received", "Reserved status confirmation", ["reserved", "sold"].includes(activeStage)],
    ["Sold / resolved", "Client journey complete", activeStage === "sold"],
  ] as const;

  return (
    <section className="bg-[#151713]/72">
      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="space-y-4">
          <div className="grid overflow-hidden border border-white/6 bg-[#101410] lg:grid-cols-[0.95fr_1.05fr]">
            <img
              src={vehicle.image}
              alt={vehicle.title}
              className="h-full min-h-[300px] w-full object-cover opacity-95"
            />
            <div className="p-5 lg:p-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#C2A878]/78">
                Selected Opportunity
              </p>
              <h2 className="mt-3 font-heading text-4xl leading-[0.98] tracking-[-0.04em]">
                {vehicle.title}
              </h2>
              <p className="mt-4 text-2xl font-light">{formatPrice(vehicle.price)}</p>
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-4">
                <Meta label="Year" value={vehicle.year?.toString() ?? "Pending"} />
                <Meta label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : "Pending"} />
                <Meta label="Dealer" value={vehicle.dealer} />
                <Meta label="Stage" value={stages.find((stage) => stage.key === activeStage)?.label ?? "New"} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {vehicle.metadata.map((item) => (
                  <span key={item} className="bg-white/[0.045] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#8E8A83]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <Panel title="Conversation">
              <p className="font-heading text-2xl leading-8 tracking-[-0.025em] text-[#f3efe7]">
                “{inquiry.message}”
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(inquiry.tags ?? ["Collector inquiry", "Documentation requested"]).map((tag) => (
                  <span key={tag} className="bg-[#183028] px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-[#C2A878]/82">
                    {tag}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel title="Internal Concierge Notes">
              <p className="text-sm leading-7 text-[#d8d2c7]">
                {inquiry.notes ?? "Confirm provenance, preferred communication cadence, and whether the client needs private storage or enclosed transport."}
              </p>
              <textarea
                className="mt-4 min-h-20 w-full resize-none border border-white/7 bg-[#101410] p-3 text-sm leading-6 text-[#d8d2c7] outline-none transition placeholder:text-[#8E8A83] focus:border-[#C2A878]/44"
                placeholder="Add concierge note..."
              />
            </Panel>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Timeline">
              <div className="space-y-3">
                {timeline.map(([label, detail, complete]) => (
                  <div key={label} className="grid grid-cols-[12px_minmax(0,1fr)] gap-3">
                    <span className={`mt-1.5 h-2 w-2 rounded-full ${complete ? "bg-[#C2A878]" : "bg-white/14"}`} />
                    <div>
                      <p className="text-sm text-[#f3efe7]">{label}</p>
                      <p className="mt-0.5 text-xs text-[#8E8A83]">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Activity History">
              <div className="space-y-3 text-sm text-[#d8d2c7]">
                <Activity text="Inquiry submitted through the public vehicle form." time={formatDateTime(inquiry.created_at)} />
                <Activity text={`Current stage: ${stages.find((stage) => stage.key === activeStage)?.label ?? "New"}.`} time="Now" />
              </div>
            </Panel>
          </div>
        </div>

        <aside className="space-y-4">
          <Panel title="Collector Profile">
            <Meta label="Full name" value={inquiry.name} />
            <Meta label="Email" value={inquiry.email} />
            <Meta label="Phone" value="Not provided" />
            <Meta label="Location" value="Not provided" />
            <Meta label="Preferred contact" value="Email" />
          </Panel>

          <Panel title="Stage Controls">
            <div className="grid gap-2">
              {stages.map((stage) => (
                <button
                  key={stage.key}
                  type="button"
                  onClick={() => onStageChange(stage.key)}
                  className={`px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.17em] transition ${
                    activeStage === stage.key
                      ? "bg-[#C2A878]/14 text-[#f3efe7]"
                      : "bg-white/[0.025] text-[#8E8A83] hover:bg-white/[0.05] hover:text-[#f3efe7]"
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Quick Actions">
            <div className="grid gap-2">
              <ActionButton icon={Phone} label="Call client" />
              <ActionButton icon={Mail} label="Email client" />
              <ActionButton icon={CalendarDays} label="Schedule viewing" />
              <ActionButton icon={Star} label="Mark VIP" />
              <ActionButton icon={UserPlus} label="Assign dealer" />
              <ActionButton icon={Archive} label="Archive inquiry" onClick={() => onStageChange("archived")} />
            </div>
          </Panel>
        </aside>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/7 bg-white/[0.025] px-4 py-3">
      <p className="text-[9px] uppercase tracking-[0.18em] text-[#8E8A83]">{label}</p>
      <p className="mt-1 text-2xl font-light text-[#f3efe7]">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white/[0.025] p-4 ring-1 ring-white/6">
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#C2A878]/78">
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8E8A83]">{label}</p>
      <p className="mt-1 text-sm text-[#f3efe7]">{value}</p>
    </div>
  );
}

function Activity({ text, time }: { text: string; time: string }) {
  return (
    <div className="border-l border-[#C2A878]/24 pl-3">
      <p className="leading-6">{text}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#8E8A83]">{time}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 items-center justify-start gap-2 bg-white/[0.025] px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f3efe7] transition hover:bg-[#C2A878]/8"
    >
      <Icon className="h-3.5 w-3.5 text-[#C2A878]/86" strokeWidth={1.6} />
      {label}
    </button>
  );
}
