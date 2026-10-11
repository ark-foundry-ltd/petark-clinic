"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "What is PetArk?", a: "PetArk is a veterinary clinic management platform that brings patient records, appointments, clinical visits and inventory into one workspace." },
  { q: "Who is PetArk designed for?", a: "PetArk is designed for veterinary clinics in Nigeria, including veterinarians, receptionists and clinic administrators, each working with the access their role needs." },
  { q: "Can I access a patient's medical history and previous treatments?", a: "Yes. Patient profiles keep medical histories, clinical visits, treatments, vaccinations and available lab results together." },
  { q: "Can PetArk help manage appointments and follow-ups?", a: "Yes. You can organize appointment requests, confirmations, schedules, treatment reminders and follow-up dates in one place." },
  { q: "How are follow-up reminders sent?", a: "Follow-up reminders go out through email, WhatsApp reminders and in-app notifications, so your clinic and pet owners are kept in the loop." },
  { q: "Does PetArk track stock quantities and expiry dates?", a: "Yes. PetArk tracks inventory quantities, batches and expiry dates, and helps you identify stock that needs attention." },
  { q: "What is the difference between the Full Platform and Standalone CMS?", a: "The Full Platform is the more complete PetArk workspace. Standalone CMS is for clinics that primarily need digital patient records and clinical management. See the pricing section to compare the plans in each category." },
  { q: "Can I choose a plan based on my clinic's needs?", a: "Yes. Switch between Full Platform and Standalone CMS in the pricing section and choose the plan that fits your clinic." },
  { q: "Can I upgrade my subscription later?", a: "PetArk offers several plans so you can choose what suits your clinic. For questions about changing plans, please contact us." },
  { q: "How do I get started with PetArk?", a: "Select Get Started to create your account and begin setting up your clinic." },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-5 py-16 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl pry-ff">Your questions, answered.</h2>
        <p className="mt-3 max-w-sm text-slate-500 sec-ff">Everything you need to know before you get your clinic set up.</p>
      </div>

      <div className="divide-y divide-slate-200 border-y border-slate-200">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q}>
              <h3>
                <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold text-slate-800 hover:text-[#319C5A] focus-visible:outline-2 focus-visible:outline-green-500 pry-ff">
                  {f.q}
                  <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180 text-green-500" : "text-slate-400"}`} />
                </button>
              </h3>
              <div id={`faq-${i}`} role="region" className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"}`}>
                <p className="overflow-hidden text-sm leading-relaxed text-slate-500 sec-ff">{f.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}