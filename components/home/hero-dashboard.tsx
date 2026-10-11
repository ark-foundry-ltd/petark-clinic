import { AlertTriangle } from "lucide-react";
import AppFrame, { Badge } from "./app-frame";

const stats = [
  { label: "Today's appointments", value: "14", sub: "9 done, 5 remaining" },
  { label: "Registered patients", value: "1,284", sub: "11 new this week" },
  { label: "Upcoming follow-ups", value: "18", sub: "5 due today" },
  { label: "Low-stock alerts", value: "3", sub: "Needs attention", alert: true },
];

const appts = [
  { i: "M", pet: "Max (Boerboel)", meta: "09:30 · Babatunde A.", status: "Completed", tone: "green" as const },
  { i: "L", pet: "Luna (British Shorthair)", meta: "10:15 · Chioma N.", status: "Confirmed", tone: "blue" as const },
  { i: "B", pet: "Bella (Labrador)", meta: "11:00 · Tunde O.", status: "Pending", tone: "amber" as const },
];

const stock = [
  { item: "Amoxicillin 250mg", note: "12 left", tone: "red" as const, tag: "Low stock" },
  { item: "Rabies Vaccine", note: "Exp. Nov 2026", tone: "amber" as const, tag: "Expiring soon" },
  { item: "Ivermectin Inj.", note: "46 in stock", tone: "green" as const, tag: "In stock" },
];

export default function HeroDashboard() {
  return (
    <AppFrame active="Dashboard">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="shrink-0 text-base font-extrabold text-slate-800">Overview</h3>
        <span className="min-w-0 truncate rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] text-slate-500">Dr. Adeyemi (On Duty)</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className={`min-w-0 rounded-xl border px-3 py-2.5 ${s.alert ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"}`}>
            <p className="text-[10px] text-slate-500">{s.label}</p>
            <p className={`text-xl font-extrabold leading-tight ${s.alert ? "text-red-500" : "text-slate-800"}`}>{s.value}</p>
            <p className="text-[10px] text-slate-500">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-1 gap-2.5">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-1 text-xs font-bold text-slate-800">Today&apos;s appointments</p>
          {appts.map((a) => (
            <div key={a.pet} className="flex items-center gap-2.5 border-t border-slate-100 py-2 text-[11px]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">{a.i}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-800">{a.pet}</p>
                <p className="truncate text-[10px] text-slate-500">{a.meta}</p>
              </div>
              <Badge tone={a.tone}>{a.status}</Badge>
            </div>
          ))}
        </div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800"><AlertTriangle size={12} className="text-amber-500" /> Inventory summary</p>
          {stock.map((s) => (
            <div key={s.item} className="border-t border-slate-100 py-2 text-[11px]">
              <div className="flex items-center justify-between gap-2"><span className="min-w-0 truncate font-semibold text-slate-800">{s.item}</span><Badge tone={s.tone}>{s.tag}</Badge></div>
              <p className="text-[10px] text-slate-500">{s.note}</p>
            </div>
          ))}
        </div>
      </div>
    </AppFrame>
  );
}