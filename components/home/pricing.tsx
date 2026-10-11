"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

type Category = "full" | "cms";
type Billing = "monthly" | "yearly";
type Plan = { id: string; name: string; tagline: string; cta: string; monthly: number; yearly: number; popular?: boolean };
/** true = included, string = shown as text, null = not on this plan ("-") */
type Cell = true | string | null;
type Row = { label: string; values: Cell[] };

const ENTERPRISE_HREF = "/contact"; // TODO: confirm contact destination

const plans: Record<Category, Plan[]> = {
  full: [
    { id: "free", name: "Free", tagline: "Get to know PetArk with the essentials of clinic management", cta: "Get Started Free", monthly: 0, yearly: 0 },
    { id: "starter", name: "Starter", tagline: "For small clinics moving from paper to digital records", cta: "Choose Starter", monthly: 15000, yearly: 150000 },
    { id: "standard", name: "Standard", tagline: "For growing clinics that need more capacity and hands-on help", cta: "Choose Standard", monthly: 30000, yearly: 300000, popular: true },
    { id: "pro", name: "Pro", tagline: "For busy, multi-branch clinics that need advanced tools and no limits", cta: "Choose Pro", monthly: 40000, yearly: 400000 },
  ],
  cms: [
    { id: "cms_starter", name: "CMS Starter", tagline: "Clinic management only, for small clinics that don't need inventory or POS", cta: "Choose CMS Starter", monthly: 12000, yearly: 120000 },
    { id: "cms_standard", name: "CMS Standard", tagline: "Clinic management only, with more capacity and referrals for growing clinics", cta: "Choose CMS Standard", monthly: 22000, yearly: 220000, popular: true },
  ],
};

const Y = true;
const N = null;

// Column order matches `plans[...]`. Features inherited via "Everything in ..." are marked included.
const rows: Record<Category, Row[]> = {
  full: [
    { label: "Staff accounts", values: ["1", "Up to 3", "Up to 8", "Up to 15"] },
    { label: "Custom roles", values: [N, "Up to 3", "Up to 8", "Up to 15"] },
    { label: "Clinic locations", values: ["Primary only", "Primary only", "Primary + 1 branch", "Primary + 2 branches"] },
    { label: "Patients", values: ["Unlimited", "Unlimited", "Unlimited", "Unlimited"] },
    { label: "Treatments per month", values: ["10", "80", "160", "Unlimited"] },
    { label: "Reminders per month", values: ["10", "80", "160", "Unlimited (fair use)"] },
    { label: "Inventory SKUs", values: [N, "25", "100", "Unlimited"] },
    { label: "Inventory and point of sale (POS)", values: [N, Y, Y, Y] },
    { label: "Appointment management", values: [Y, Y, Y, Y] },
    { label: "Pet profiles and visit history", values: [Y, Y, Y, Y] },
    { label: "Manual SOAP notes", values: [Y, Y, Y, Y] },
    { label: "Treatment and visit summaries", values: [N, Y, Y, Y] },
    { label: "Basic clinic, sales and inventory reports", values: [N, Y, Y, Y] },
    { label: "Lab results", values: [N, N, Y, Y] },
    { label: "Drug dosage calculator", values: [N, N, Y, Y] },
    { label: "Vitals trends", values: [N, N, N, Y] },
    { label: "Revenue and appointment analytics", values: [N, N, N, Y] },
    { label: "Cross-clinic referrals", values: [N, N, N, Y] },
    { label: "Support", values: ["Help center and setup guides", "Email, business hours", "Priority support", "Same-day for standard issues"] },
    { label: "Onboarding", values: [N, "Onboarding checklist", "Guided session", "Dedicated onboarding"] },
    { label: "Data migration", values: [N, "Excel/CSV import template", "Assisted Excel/CSV", "Managed migration"] },
    { label: "Staff training and go-live assistance", values: [N, N, N, Y] },
  ],
  cms: [
    { label: "Staff accounts", values: ["Up to 3", "Up to 8"] },
    { label: "Custom roles", values: ["Up to 3", "Up to 8"] },
    { label: "Clinic locations", values: ["Primary only", "Primary only"] },
    { label: "Patients", values: ["Unlimited", "Unlimited"] },
    { label: "Treatments per month", values: ["80", "160"] },
    { label: "Reminders per month", values: ["80", "160"] },
    { label: "Inventory and point of sale (POS)", values: [N, N] },
    { label: "Additional branches", values: [N, N] },
    { label: "Appointment management", values: [Y, Y] },
    { label: "Pet profiles and visit history", values: [Y, Y] },
    { label: "Manual SOAP notes", values: [Y, Y] },
    { label: "Treatment and visit summaries", values: [Y, Y] },
    { label: "Basic clinic reports", values: [Y, Y] },
    { label: "Lab results", values: [N, Y] },
    { label: "Drug dosage calculator", values: [N, Y] },
    { label: "Receive referrals from other clinics", values: [N, Y] },
    { label: "Support", values: ["Email, business hours", "Priority support"] },
    { label: "Onboarding", values: ["Onboarding checklist", "Guided session"] },
    { label: "Data migration", values: ["Excel/CSV import template", "Assisted Excel/CSV"] },
  ],
};

const naira = (n: number) => `₦${n.toLocaleString("en-US")}`;

function Segmented<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: { value: T; text: string }[] }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-green-500 sec-ff ${value === o.value ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
          {o.text}
        </button>
      ))}
    </div>
  );
}

function CellView({ value }: { value: Cell }) {
  if (value === true) return <Check size={16} strokeWidth={2.5} className="text-slate-800" aria-label="Included" />;
  if (value === null) return <span className="text-slate-300" aria-label="Not included">-</span>;
  return <span className="font-semibold text-slate-900">{value}</span>;
}

function Comparison({ category, list, billing }: { category: Category; list: Plan[]; billing: Billing }) {
  const [open, setOpen] = useState(false);
  const price = (p: Plan) => (p.monthly === 0 ? "₦0" : `${naira(billing === "monthly" ? p.monthly : p.yearly)} / ${billing === "monthly" ? "month" : "year"}`);

  return (
    <div className="mt-10">
      <div className="flex justify-center">
        <button type="button" aria-expanded={open} aria-controls="compare-plans" onClick={() => setOpen(!open)}
          className="sec-ff inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-[#319C5A] focus-visible:outline-2 focus-visible:outline-green-500">
          Compare plans <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      <div id="compare-plans" aria-hidden={!open} className={`grid transition-all duration-300 ${open ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th scope="col" className="sticky left-0 z-10 w-56 bg-white px-5 py-4"><span className="sr-only">Features</span></th>
                  {list.map((p) => (
                    <th key={p.id} scope="col" className="sec-ff px-5 py-4 font-bold text-slate-900">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200">
                  <th scope="row" className="pry-ff sticky left-0 z-10 bg-white px-5 py-3.5 font-medium text-slate-500">Price</th>
                  {list.map((p) => <td key={p.id} className="sec-ff px-5 py-3.5 font-semibold text-slate-900">{price(p)}</td>)}
                </tr>
                {rows[category].map((r) => (
                  <tr key={r.label} className="border-b border-slate-200 last:border-0">
                    <th scope="row" className="pry-ff sticky left-0 z-10 bg-white px-5 py-3.5 font-medium text-slate-500">{r.label}</th>
                    {r.values.map((v, i) => (
                      <td key={list[i].id} className="pry-ff px-5 py-3.5"><CellView value={v} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [category, setCategory] = useState<Category>("full");
  const [billing, setBilling] = useState<Billing>("monthly");
  const list = plans[category];

  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
      <h2 className="sec-ff text-center text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl">Choose the tools your clinic needs.</h2>
      <p className="pry-ff mx-auto mt-3 max-w-lg text-center text-slate-500">Start with the essentials or choose a more complete platform for your clinic.</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Segmented label="Pricing category" value={category} onChange={setCategory} options={[{ value: "full", text: "Full Platform" }, { value: "cms", text: "Standalone CMS" }]} />
        <Segmented label="Billing period" value={billing} onChange={setBilling} options={[{ value: "monthly", text: "Monthly" }, { value: "yearly", text: "Yearly" }]} />
      </div>

      <div className={`mx-auto mt-10 grid gap-4 ${category === "full" ? "sm:grid-cols-2 lg:grid-cols-4" : "max-w-3xl sm:grid-cols-2"}`}>
        {list.map((p) => {
          const free = p.monthly === 0;
          const amount = billing === "monthly" ? p.monthly : p.yearly;
          return (
            <div key={p.id} className={`relative flex flex-col rounded-2xl border bg-white p-6 ${p.popular ? "border-2 border-green-500 shadow-lg shadow-green-100" : "border-slate-200"}`}>
              {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-green-500 px-3 py-0.5 text-[11px] font-bold text-white">Most Popular</span>}
              <h3 className="sec-ff font-bold text-slate-800">{p.name}</h3>
              <p className="mt-4">
                <span className="sec-ff text-3xl font-extrabold text-slate-900">{free ? "₦0" : naira(amount)}</span>
                {!free && <span className="ml-1 text-sm text-slate-500">/{billing === "monthly" ? "month" : "year"}</span>}
              </p>
              <p className="pry-ff mt-3 flex-1 text-sm leading-relaxed text-slate-500">{p.tagline}</p>
              <Link href="/signup" className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 sec-ff ${p.popular ? "bg-green-500 text-white hover:bg-green-600" : "border border-slate-200 text-slate-800 hover:bg-slate-50"}`}>{p.cta}</Link>
            </div>
          );
        })}
      </div>

      <Comparison category={category} list={list} billing={billing} />

      <p className="pry-ff mt-8 text-center text-sm text-slate-500">
        Need a tailored solution? <Link href={ENTERPRISE_HREF} className="font-semibold text-[#319C5A] hover:underline">Contact us about Enterprise.</Link>
      </p>
    </section>
  );
}