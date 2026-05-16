"use client";

import { ArrowDownUp, Eye, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { LoadingState } from "@/components/loading-state";
import {
  bulkDeleteInquiries,
  bulkUpdateInquiryState,
  deleteInquiry,
  getDashboardInquiries,
} from "@/lib/api";
import type { Inquiry } from "@/lib/types";

type InquiryStage = "new" | "contacted" | "negotiating" | "reserved" | "sold" | "archived";
type SortKey =
  | "name"
  | "email"
  | "phone"
  | "location"
  | "inquiry_type"
  | "vehicle_of_interest"
  | "budget_range"
  | "preferred_contact_method"
  | "timeline"
  | "state"
  | "created_at";

const stages: Array<{ key: InquiryStage; label: string }> = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "negotiating", label: "Negotiating" },
  { key: "reserved", label: "Reserved" },
  { key: "sold", label: "Sold" },
  { key: "archived", label: "Archived" },
];

const inquiryTypeLabels: Record<string, string> = {
  buy: "Buy",
  sell: "Sell / Consign",
  sourcing: "Private sourcing",
  general: "General",
};

const contactMethodLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  text: "Text",
};

const timelineLabels: Record<string, string> = {
  immediately: "Immediately",
  "30_days": "30 days",
  "3_6_months": "3-6 months",
  just_exploring: "Just exploring",
};

const sortableColumns: Array<{ key: SortKey; label: string }> = [
  { key: "name", label: "Customer" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "inquiry_type", label: "Type" },
  { key: "vehicle_of_interest", label: "Vehicle" },
  { key: "budget_range", label: "Budget" },
  { key: "preferred_contact_method", label: "Contact" },
  { key: "timeline", label: "Timeline" },
  { key: "state", label: "Status" },
  { key: "created_at", label: "Created" },
];

function normalizeStage(state: string | null | undefined): InquiryStage {
  const normalized = (state ?? "new").toLowerCase();
  return stages.some((stage) => stage.key === normalized) ? (normalized as InquiryStage) : "new";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function valueOrDash(value: string | null | undefined) {
  return value?.trim() || "-";
}

function displayInquiryType(value: string | null | undefined) {
  return value ? (inquiryTypeLabels[value] ?? value) : "-";
}

function displayContactMethod(value: string | null | undefined) {
  return value ? (contactMethodLabels[value] ?? value) : "-";
}

function displayTimeline(value: string | null | undefined) {
  return value ? (timelineLabels[value] ?? value) : "-";
}

function messageText(inquiry: Inquiry) {
  return inquiry.message_body?.trim() || inquiry.message;
}

function preview(value: string, length = 90) {
  return value.length > length ? `${value.slice(0, length).trim()}...` : value;
}

function sortValue(inquiry: Inquiry, key: SortKey) {
  if (key === "created_at") {
    return new Date(inquiry.created_at).getTime();
  }
  return String(inquiry[key] ?? "").toLowerCase();
}

export function DashboardInquiriesContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [bulkStatus, setBulkStatus] = useState<InquiryStage>("contacted");
  const [pendingStatusChanges, setPendingStatusChanges] = useState<Record<number, InquiryStage>>(
    {}
  );
  const [viewingInquiry, setViewingInquiry] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState("Loading inquiries...");
  const [error, setError] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    async function loadInquiries() {
      try {
        const data = await getDashboardInquiries();
        setInquiries(data);
        setStatus("");
      } catch (loadError) {
        setStatus(loadError instanceof Error ? loadError.message : "Could not load inquiries.");
      }
    }

    void loadInquiries();
  }, []);

  const filteredInquiries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const filtered = inquiries.filter((inquiry) => {
      const state = normalizeStage(inquiry.state);
      if (statusFilter !== "all" && state !== statusFilter) {
        return false;
      }
      if (typeFilter !== "all" && inquiry.inquiry_type !== typeFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [
        inquiry.name,
        inquiry.email,
        inquiry.phone,
        inquiry.location,
        inquiry.vehicle_of_interest,
        inquiry.budget_range,
        inquiry.inquiry_type,
        inquiry.state,
        messageText(inquiry),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });

    return [...filtered].sort((a, b) => {
      const aValue = sortValue(a, sortKey);
      const bValue = sortValue(b, sortKey);
      const result = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortDirection === "asc" ? result : -result;
    });
  }, [inquiries, searchTerm, sortDirection, sortKey, statusFilter, typeFilter]);

  const allVisibleSelected =
    filteredInquiries.length > 0 &&
    filteredInquiries.every((inquiry) => selectedIds.includes(inquiry.id));
  const pendingChangeCount = Object.keys(pendingStatusChanges).length;
  const canUpdateStatuses = selectedIds.length > 0 || pendingChangeCount > 0;

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "created_at" ? "desc" : "asc");
  }

  function toggleSelected(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]
    );
  }

  function toggleSelectAllVisible() {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !filteredInquiries.some((inquiry) => inquiry.id === id))
      );
      return;
    }
    setSelectedIds((current) => [
      ...new Set([...current, ...filteredInquiries.map((inquiry) => inquiry.id)]),
    ]);
  }

  function handleStatusChange(id: number, nextStatus: string) {
    setError("");
    const inquiry = inquiries.find((item) => item.id === id);
    const normalizedNextStatus = normalizeStage(nextStatus);
    if (!inquiry) {
      return;
    }

    setPendingStatusChanges((current) => {
      const next = { ...current };
      if (normalizeStage(inquiry.state) === normalizedNextStatus) {
        delete next[id];
      } else {
        next[id] = normalizedNextStatus;
      }
      return next;
    });
  }

  async function handleSaveStatusChanges() {
    if (!canUpdateStatuses) {
      return;
    }

    const changes = new Map<number, InquiryStage>();
    for (const [id, nextStatus] of Object.entries(pendingStatusChanges)) {
      changes.set(Number(id), nextStatus);
    }
    for (const id of selectedIds) {
      changes.set(id, bulkStatus);
    }

    const groupedChanges = stages
      .map((stage) => ({
        state: stage.key,
        ids: [...changes.entries()]
          .filter(([, nextStatus]) => nextStatus === stage.key)
          .map(([id]) => id),
      }))
      .filter((group) => group.ids.length > 0);

    setIsWorking(true);
    setError("");
    try {
      await Promise.all(
        groupedChanges.map((group) => bulkUpdateInquiryState(group.ids, group.state))
      );
      setInquiries((current) =>
        current.map((inquiry) => {
          const nextStatus = changes.get(inquiry.id);
          return nextStatus ? { ...inquiry, state: nextStatus } : inquiry;
        })
      );
      setPendingStatusChanges({});
      setSelectedIds([]);
    } catch (bulkError) {
      setError(
        bulkError instanceof Error ? bulkError.message : "Could not update inquiry statuses."
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this inquiry?")) {
      return;
    }
    setIsWorking(true);
    setError("");
    try {
      await deleteInquiry(id);
      setInquiries((current) => current.filter((inquiry) => inquiry.id !== id));
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
      setPendingStatusChanges((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      setViewingInquiry((current) => (current?.id === id ? null : current));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete inquiry.");
    } finally {
      setIsWorking(false);
    }
  }

  async function handleBulkDelete() {
    if (
      selectedIds.length === 0 ||
      !window.confirm(`Delete ${selectedIds.length} selected inquiries?`)
    ) {
      return;
    }
    setIsWorking(true);
    setError("");
    try {
      await bulkDeleteInquiries(selectedIds);
      setInquiries((current) => current.filter((inquiry) => !selectedIds.includes(inquiry.id)));
      setViewingInquiry((current) =>
        current && selectedIds.includes(current.id) ? null : current
      );
      setPendingStatusChanges((current) => {
        const next = { ...current };
        for (const id of selectedIds) {
          delete next[id];
        }
        return next;
      });
      setSelectedIds([]);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not delete selected inquiries."
      );
    } finally {
      setIsWorking(false);
    }
  }

  if (status) {
    return <LoadingState message={status} />;
  }

  return (
    <div className="text-[#f3efe7] lg:pr-10 xl:pr-14">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C2A878]/76">
            Dashboard / Inquiries
          </p>
          <h1 className="mt-2 font-heading text-4xl leading-none tracking-[-0.04em]">
            Inquiry manager
          </h1>
          <p className="mt-3 text-sm text-[#8E8A83]">
            Review, filter, sort, update, and delete customer inquiry submissions.
          </p>
        </div>
        <div className="grid w-full grid-cols-3 gap-2 text-left sm:w-auto sm:gap-3 sm:text-right">
          <Metric label="Total" value={inquiries.length.toString()} />
          <Metric label="Visible" value={filteredInquiries.length.toString()} />
          <Metric label="Changes" value={(selectedIds.length + pendingChangeCount).toString()} />
        </div>
      </div>

      {error ? (
        <div className="mb-4 border border-[#8F4E42]/50 bg-[#2A100D]/70 px-4 py-3 text-sm text-[#F0C8BF]">
          {error}
        </div>
      ) : null}

      <section className="border border-white/7 bg-[#151713]/72">
        <div className="grid gap-3 border-b border-white/7 p-4 sm:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
          <label className="relative sm:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8E8A83]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, email, phone, vehicle, status, type..."
              className="h-10 w-full border border-white/10 bg-[#0D1411] pl-9 pr-3 text-sm text-[#f3efe7] outline-none transition placeholder:text-[#8E8A83] focus:border-[#C2A878]/52"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 w-full border border-white/10 bg-[#0D1411] px-3 text-sm text-[#f3efe7] outline-none focus:border-[#C2A878]/52"
          >
            <option value="all">All statuses</option>
            {stages.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="h-10 w-full border border-white/10 bg-[#0D1411] px-3 text-sm text-[#f3efe7] outline-none focus:border-[#C2A878]/52"
          >
            <option value="all">All types</option>
            {Object.entries(inquiryTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
            className="h-10 w-full border border-white/10 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f3efe7] transition hover:border-[#C2A878]/42"
          >
            Clear filters
          </button>
        </div>

        <div className="flex flex-col gap-3 border-b border-white/7 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8E8A83]">
              {selectedIds.length} selected · {pendingChangeCount} unsaved
            </span>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as InquiryStage)}
              className="h-10 border border-white/10 bg-[#0D1411] px-3 text-xs text-[#f3efe7] outline-none focus:border-[#C2A878]/52"
              disabled={selectedIds.length === 0 || isWorking}
            >
              {stages.map((stage) => (
                <option key={stage.key} value={stage.key}>
                  {stage.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSaveStatusChanges}
              disabled={!canUpdateStatuses || isWorking}
              className="h-10 border border-[#C2A878]/32 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f3efe7] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="inline-flex items-center gap-2">
                <Save className="h-3.5 w-3.5" strokeWidth={1.6} />
                Update
              </span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0 || isWorking}
              className="h-10 border border-[#8F4E42]/60 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#F0C8BF] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Bulk delete
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            disabled={selectedIds.length === 0}
            className="h-10 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8E8A83] transition hover:text-[#f3efe7] disabled:opacity-40"
          >
            Clear selection
          </button>
        </div>

        <div className="overflow-x-auto overscroll-x-contain">
          <table className="min-w-[1680px] w-full border-collapse text-left text-sm">
            <thead className="bg-[#0D1411] text-[10px] uppercase tracking-[0.14em] text-[#C2A878]/78">
              <tr>
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible inquiries"
                  />
                </th>
                {sortableColumns.map((column) => (
                  <th key={column.key} className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="inline-flex items-center gap-1.5 transition hover:text-[#f3efe7]"
                    >
                      {column.label}
                      <ArrowDownUp className="h-3 w-3" strokeWidth={1.6} />
                    </button>
                  </th>
                ))}
                <th className="px-3 py-3">Message</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/7">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={14} className="px-4 py-12 text-center text-sm text-[#8E8A83]">
                    No inquiries match the current filters.
                  </td>
                </tr>
              ) : null}

              {filteredInquiries.map((inquiry) => {
                const savedStage = normalizeStage(inquiry.state);
                const stage = pendingStatusChanges[inquiry.id] ?? savedStage;
                const hasPendingChange = stage !== savedStage;
                return (
                  <tr
                    key={inquiry.id}
                    className={`transition hover:bg-white/[0.035] ${
                      hasPendingChange ? "bg-[#C2A878]/10" : "bg-[#151713]/50"
                    }`}
                  >
                    <td className="px-3 py-3 align-top">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(inquiry.id)}
                        onChange={() => toggleSelected(inquiry.id)}
                        aria-label={`Select inquiry from ${inquiry.name}`}
                      />
                    </td>
                    <td className="px-3 py-3 align-top font-medium text-[#f3efe7]">
                      {inquiry.name}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">{inquiry.email}</td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {valueOrDash(inquiry.phone)}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {valueOrDash(inquiry.location)}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {displayInquiryType(inquiry.inquiry_type)}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {valueOrDash(inquiry.vehicle_of_interest ?? inquiry.car_title)}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {valueOrDash(inquiry.budget_range)}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {displayContactMethod(inquiry.preferred_contact_method)}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {displayTimeline(inquiry.timeline)}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <select
                        value={stage}
                        onChange={(event) => handleStatusChange(inquiry.id, event.target.value)}
                        className="h-8 border border-white/10 bg-[#0D1411] px-2 text-xs text-[#f3efe7] outline-none focus:border-[#C2A878]/52"
                      >
                        {stages.map((option) => (
                          <option key={option.key} value={option.key}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {hasPendingChange ? (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#C2A878]">
                          Unsaved
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 align-top text-[#d8d2c7]">
                      {formatDate(inquiry.created_at)}
                    </td>
                    <td className="max-w-[280px] px-3 py-3 align-top text-[#d8d2c7]">
                      {preview(messageText(inquiry))}
                    </td>
                    <td className="px-3 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingInquiry(inquiry)}
                          className="inline-flex h-8 w-8 items-center justify-center border border-white/10 text-[#f3efe7] transition hover:border-[#C2A878]/50"
                          aria-label="View full message"
                        >
                          <Eye className="h-4 w-4" strokeWidth={1.6} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(inquiry.id)}
                          className="inline-flex h-8 w-8 items-center justify-center border border-[#8F4E42]/50 text-[#F0C8BF] transition hover:border-[#F0C8BF]/70"
                          aria-label="Delete inquiry"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {viewingInquiry ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
          <section className="max-h-[88vh] w-full max-w-4xl overflow-y-auto border border-white/10 bg-[#151713] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#C2A878]/78">
                  Inquiry details
                </p>
                <h2 className="mt-2 text-xl font-medium text-[#f3efe7]">{viewingInquiry.name}</h2>
                <p className="mt-1 text-sm text-[#8E8A83]">
                  {displayInquiryType(viewingInquiry.inquiry_type)} ·{" "}
                  {formatDate(viewingInquiry.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingInquiry(null)}
                className="inline-flex h-9 w-9 items-center justify-center border border-white/10 text-[#f3efe7]"
                aria-label="Close message"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <Detail label="Customer name" value={viewingInquiry.name} />
              <Detail label="Email" value={viewingInquiry.email} />
              <Detail label="Phone" value={viewingInquiry.phone} />
              <Detail label="Location" value={viewingInquiry.location} />
              <Detail
                label="Inquiry type"
                value={displayInquiryType(viewingInquiry.inquiry_type)}
              />
              <Detail
                label="Status"
                value={
                  stages.find((stage) => stage.key === normalizeStage(viewingInquiry.state))?.label
                }
              />
              <Detail
                label="Vehicle of interest"
                value={viewingInquiry.vehicle_of_interest ?? viewingInquiry.car_title}
              />
              <Detail label="Budget range" value={viewingInquiry.budget_range} />
              <Detail
                label="Preferred contact"
                value={displayContactMethod(viewingInquiry.preferred_contact_method)}
              />
              <Detail label="Timeline" value={displayTimeline(viewingInquiry.timeline)} />
              <Detail label="Dealer" value={viewingInquiry.dealer_name} />
              <Detail label="Created" value={formatDate(viewingInquiry.created_at)} />
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#C2A878]/78">
                Full message
              </p>
              <div className="mt-3 whitespace-pre-wrap border border-white/7 bg-[#0D1411] p-4 text-sm leading-7 text-[#d8d2c7]">
                {messageText(viewingInquiry)}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="border border-white/7 bg-[#0D1411] p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-[#8E8A83]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#f3efe7]">{valueOrDash(value)}</p>
    </div>
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
