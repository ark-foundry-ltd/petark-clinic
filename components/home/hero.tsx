import Link from "next/link";
import { Check } from "lucide-react";
import HeroDashboard from "./hero-dashboard";

const benefits = ["Organized patient records", "Easier appointment management", "Inventory and expiry tracking"];

export default function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:pt-16">
      <div className="min-w-0">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#D7F9E5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#319C5A]">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 sec-ff" /> Veterinary clinic management, simplified
        </span>
        <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#333333] sm:text-5xl pry-ff">
          Your clinic&apos;s records, appointments and inventory. <span className="text-[#319C5A]">Finally in one place.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500 sec-ff">
          Stop juggling paper files, missed follow-ups and scattered stock records. PetArk helps your team manage daily clinic operations from one organized platform.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 sec-ff">Get Started</Link>
          <a href="#features" className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 pry-ff">Explore Features</a>
        </div>
        <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-slate-500">
          {benefits.map((b) => (
            <li key={b} className="flex items-center gap-1.5 sec-ff">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#319C5A] text-white"><Check size={10} strokeWidth={3} /></span>{b}
            </li>
          ))}
        </ul>
      </div>
      <div className="min-w-0">
        <HeroDashboard />
      </div>
    </section>
  );
}