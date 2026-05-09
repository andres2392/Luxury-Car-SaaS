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
    <div className="flex min-h-[132px] flex-col border border-white/6 bg-white/[0.03] px-5 py-4 backdrop-blur-sm">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8E8A83]">{label}</p>
      <p className="mt-2 font-heading text-4xl tracking-[-0.04em] text-[#F3EFE7]">{value}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8E8A83]">{helper}</p>
    </div>
  );
}
