import { CalendarClock, Check, FolderOpen, PackageSearch, X } from "lucide-react";

const items = [
  { icon: FolderOpen, problem: "Patient files are scattered.", solution: "Keep patient profiles, medical histories, clinical visits, treatments, vaccinations and available lab results organized digitally." },
  { icon: CalendarClock, problem: "Appointments and follow-ups are easy to forget.", solution: "Organize appointment requests, confirmations, schedules, treatment reminders and follow-up dates in one place." },
  { icon: PackageSearch, problem: "You don't always know what is running low or expiring.", solution: "Track inventory quantities, batches and expiry dates, and identify stock that needs attention." },
];

export default function ProblemSolution() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
      <h2 className="mx-auto max-w-2xl text-center text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl pry-ff">
        Less time chasing records. More time caring for animals.
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {items.map(({ icon: Icon, problem, solution }) => (
          <article key={problem} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="bg-slate-50 p-6">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200"><Icon size={19} /></span>
              <p className="flex gap-2.5 font-bold text-slate-800 pry-ff">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-500"><X size={12} strokeWidth={3} /></span>{problem}
              </p>
            </div>
            <div className="bg-[#D7F9E5]/60 p-6 sec-ff">
              <p className="flex gap-2.5 text-sm leading-relaxed text-slate-700">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-500 text-white"><Check size={12} strokeWidth={3} /></span>{solution}
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-10 text-center text-lg font-bold text-[#319C5A] pry-ff">One connected workspace for the everyday running of your veterinary clinic.</p>
    </section>
  );
}