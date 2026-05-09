export function DashboardSummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col border border-white/6 bg-white/[0.03] px-6 py-7 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E8A83]">{label}</p>
      <p className="mt-4 font-heading text-5xl tracking-[-0.04em] text-[#F3EFE7]">{value}</p>
      <p className="mt-auto pt-4 text-sm leading-7 text-[#8E8A83]">{helper}</p>
    </div>
  );
}
