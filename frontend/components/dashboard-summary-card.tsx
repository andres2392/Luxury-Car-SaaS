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
    <div className="flex min-h-[220px] flex-col border border-[#2b2d29] bg-[#1a1b18] px-5 py-6">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#8f968c]">{label}</p>
      <p className="mt-4 font-heading text-5xl tracking-[-0.04em] text-[#f1eadf]">{value}</p>
      <p className="mt-auto pt-4 text-sm leading-7 text-[#9fa496]">{helper}</p>
    </div>
  );
}
