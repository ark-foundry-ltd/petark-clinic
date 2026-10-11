import type { ReactNode } from "react";
import AppFrame, { Badge } from "./app-frame";

function Preview({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <article className="flex min-w-0 flex-col">
      <div className="text-[11px]">{children}</div>
      <h3 className="mt-5 text-lg font-extrabold text-[#333333] pry-ff">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500 sec-ff">{text}</p>
    </article>
  );
}

const Row = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-between gap-2 border-t border-slate-100 py-1.5">{children}</div>
);
const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mt-2 min-w-0 rounded-xl border border-slate-200 bg-white p-2.5">
    <p className="mb-0.5 text-[11px] font-bold text-slate-800 sec-ff">{title}</p>
    {children}
  </div>
);

function Patient() {
  return (
    <AppFrame active="Patients" rail>
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-100 font-bold text-green-700 sec-ff">M</span>
        <div className="min-w-0 flex-1 pry-ff">
          <p className="text-sm font-extrabold text-slate-800">Max</p>
          <p className="truncate text-[10px] text-slate-500">Boerboel · Male · 4 yrs · Owner: Babatunde A.</p>
        </div>
        <span className="shrink-0 whitespace-nowrap rounded-lg bg-green-500 px-2.5 py-1.5 text-[10px] font-bold text-white sec-ff">Start Visit</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-b border-slate-200 pb-1.5 text-[10px] font-semibold text-slate-500 pry-ff">
        <span className="border-b-2 border-green-500 pb-1 text-green-700">History</span><span>Visits</span><span>Treatments</span><span>Vaccinations</span><span>Labs</span>
      </div>
      <Card title="Recent visits">
        <Row><span className="min-w-0 truncate">Skin irritation check</span><span className="shrink-0 text-slate-500">02 Oct</span></Row>
        <Row><span className="min-w-0 truncate">Routine wellness exam</span><span className="shrink-0 text-slate-500">14 Aug</span></Row>
      </Card>
      <Card title="Vaccinations">
        <Row><span className="min-w-0 truncate">Rabies</span><Badge tone="green">Up to date</Badge></Row>
        <Row><span className="min-w-0 truncate">DHPP booster</span><Badge tone="amber">Due Nov</Badge></Row>
      </Card>
      <Card title="Lab results">
        <Row><span className="min-w-0 truncate">Complete blood count</span><Badge tone="blue">Available</Badge></Row>
      </Card>
    </AppFrame>
  );
}

function Appointments() {
  return (
    <AppFrame active="Appointments" rail>
      <p className="text-sm font-extrabold text-slate-800">Today</p>
      <Card title="Appointments">
        <Row><span className="min-w-0 truncate">09:30 Max · Check-up</span><Badge tone="green">Completed</Badge></Row>
        <Row><span className="min-w-0 truncate">10:15 Luna · Vaccination</span><Badge tone="blue">Confirmed</Badge></Row>
        <Row><span className="min-w-0 truncate">11:00 Bella · Dental</span><Badge tone="amber">Pending</Badge></Row>
        <Row><span className="min-w-0 truncate">12:30 Rex · Review</span><Badge tone="slate">Scheduled</Badge></Row>
      </Card>
      <Card title="Upcoming follow-ups">
        <Row><span className="min-w-0 truncate">Coco · Wound dressing</span><Badge tone="red">Due today</Badge></Row>
        <Row><span className="min-w-0 truncate">Simba · Second dose</span><Badge tone="amber">Tomorrow</Badge></Row>
        <Row><span className="min-w-0 truncate">Duke · Post-op check</span><Badge tone="slate">16 Oct</Badge></Row>
      </Card>
    </AppFrame>
  );
}

function Inventory() {
  const rows = [
    ["Amoxicillin 250mg", "12", "AX-2407", "Mar 2027", "Low stock", "red"],
    ["Rabies Vaccine", "8", "RV-1125", "Nov 2026", "Expiring soon", "amber"],
    ["Ivermectin Inj.", "46", "IV-0926", "Aug 2027", "In stock", "green"],
  ] as const;
  return (
    <AppFrame active="Inventory" rail>
      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5"><p className="text-[10px] text-slate-500">Today&apos;s sales</p><p className="truncate text-base font-extrabold text-slate-800">₦96,500</p></div>
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-2.5"><p className="text-[10px] text-slate-500">This week</p><p className="truncate text-base font-extrabold text-slate-800">₦386,000</p></div>
      </div>
      <Card title="Stock">
        {rows.map(([item, qty, batch, exp, tag, tone]) => (
          <div key={item} className="flex items-center justify-between gap-2 border-t border-slate-100 py-1.5">
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">{item}</p>
              <p className="truncate text-[10px] text-slate-500">Qty {qty} · Batch {batch} · Exp. {exp}</p>
            </div>
            <Badge tone={tone}>{tag}</Badge>
          </div>
        ))}
      </Card>
    </AppFrame>
  );
}

export default function DashboardPreviews() {
  return (
    <section className="bg-slate-50/70 py-16">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl pry-ff">See your clinic come together.</h2>
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-6">
          <Preview title="Every patient's history, easier to find." text="Access the information your team needs without searching through piles of files."><Patient /></Preview>
          <Preview title="Keep the next step in care visible." text="Give your team a clearer view of scheduled visits and follow-up responsibilities."><Appointments /></Preview>
          <Preview title="Know what's in stock and what needs attention." text="Keep supplies, expiry dates and sales activity organized."><Inventory /></Preview>
        </div>
      </div>
    </section>
  );
}