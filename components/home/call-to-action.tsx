import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CallToAction() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-5">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Bring your clinic into one place</h2>
          <p className="mx-auto mb-7 mt-3 max-w-md text-slate-500">Set up PetArk in minutes and give your team a calmer, more organized day.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-600">
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}