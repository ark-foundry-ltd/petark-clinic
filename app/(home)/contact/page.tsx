import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Building2, GitBranch, GraduationCap, Landmark, Mail } from "lucide-react";
import ContactForm from "@/components/home/contact-form";

export const metadata: Metadata = {
  title: "Contact us | PetArk",
  description: "Talk to the PetArk team about Enterprise plans, multi-branch clinics and hospitals.",
};

const fits = [
  { icon: GitBranch, text: "Multi-branch clinic groups" },
  { icon: Landmark, text: "State and government hospitals" },
  { icon: GraduationCap, text: "Veterinary teaching hospitals" },
  { icon: Building2, text: "Large private practices" },
];

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
      <Link href="/" className="pry-ff inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-green-500">
        <ArrowLeft size={15} /> Back to home
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-5 lg:gap-14">
        {/* Left: context */}
        <div className="lg:col-span-2">
          <h1 className="sec-ff text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl">Let&apos;s talk about your clinic.</h1>
          <p className="pry-ff mt-4 text-slate-500">
            Tell us about your practice and what you need. We&apos;ll reply with a plan that fits, usually within one business day.
          </p>

          <div className="mt-8">
            <p className="sec-ff text-sm font-bold text-slate-800">Enterprise is a good fit for</p>
            <ul className="mt-3 space-y-3">
              {fits.map(({ icon: Icon, text }) => (
                <li key={text} className="pry-ff flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D7F9E5] text-[#319C5A]"><Icon size={17} /></span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#D7F9E5] text-[#319C5A]"><Mail size={17} /></span>
              <div className="min-w-0">
                <p className="pry-ff text-xs font-medium text-slate-500">Prefer email?</p>
                <a href="mailto:hello@usepetark.com" className="sec-ff block truncate text-sm font-bold text-slate-900 hover:text-[#319C5A]">hello@usepetark.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}