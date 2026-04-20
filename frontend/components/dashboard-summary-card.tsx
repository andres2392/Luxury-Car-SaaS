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
    <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
      <p className="text-xs uppercase tracking-[0.18em] text-[#7f8ea3]">{label}</p>
      <p className="mt-4 font-heading text-5xl tracking-[-0.04em] text-white">{value}</p>
      <p className="mt-3 text-sm leading-7 text-[#95a8c0]">{helper}</p>
    </div>
  );
}

