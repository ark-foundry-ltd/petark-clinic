import type { ReactNode } from "react";
import { CalendarDays, FileText, LayoutDashboard, Package, PawPrint, Receipt, type LucideIcon } from "lucide-react";

const menu: { label: string; icon: LucideIcon }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: PawPrint },
  { label: "Appointments", icon: CalendarDays },
  { label: "Clinical", icon: FileText },
  { label: "Inventory", icon: Package },
  { label: "Sales", icon: Receipt },
];

const tones = {
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-600",
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
} as const;

export function Badge({ tone = "slate", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-block shrink-0 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-semibold ${tones[tone]}`}>{children}</span>;
}

type Props = { active: string; rail?: boolean; children: ReactNode };

/** Shared PetArk app window so every mockup looks like the same product. */
export default function AppFrame({ active, rail = false, children }: Props) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 sec-ff">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-400" />
        <span className="ml-3 min-w-0 truncate">City Vet Clinic, Lekki</span>
      </div>
      <div className="flex min-w-0">
        <aside className={`shrink-0 border-r border-slate-100 p-2 ${rail ? "w-11" : "hidden w-40 sm:block"}`}>
          {menu.map(({ label, icon: Icon }) => (
            <span key={label} title={label} className={`mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold ${label === active ? "bg-green-500 text-white" : "text-slate-500"} ${rail ? "justify-center px-0" : ""}`}>
              <Icon size={14} className="shrink-0" />
              {!rail && label}
            </span>
          ))}
        </aside>
        {/* min-w-0 + overflow-hidden stops wide children from stretching the frame */}
        <div className="min-w-0 flex-1 overflow-hidden bg-slate-50/70 p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}