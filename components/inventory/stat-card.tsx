// components/inventory/stat-card.tsx

export default function StatCard({
    label,
    value,
    valueClassName = "text-slate-800",
}: Readonly<{
    label: string;
    value: string;
    valueClassName?: string;
}>) {
    return (
        <div className="rounded-xl border border-slate-100 bg-pry-clr p-4 shadow-sm">
            <div className="text-xs text-slate-400">{label}</div>
            <div className={`mt-1 text-2xl font-semibold ${valueClassName}`}>{value}</div>
        </div>
    );
}