import { CalendarDays, ClipboardList, CreditCard, Package } from "lucide-react";

const features = [
  { icon: ClipboardList, title: "Patient records", text: "Full clinical history, vaccinations and notes for every patient, searchable in seconds." },
  { icon: CalendarDays, title: "Appointments", text: "Book, confirm and track visits with follow-up reminders for pet owners." },
  { icon: Package, title: "Inventory", text: "See what is running low and what is about to expire before it becomes a problem." },
  { icon: CreditCard, title: "Billing", text: "Invoices, payments and revenue reports in naira, all in one view." },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">Everything your clinic runs on</h2>
        <p className="mx-auto mb-10 mt-3 max-w-lg text-center text-slate-500">One workspace for the front desk, the vets and the stock room.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-green-50 text-green-600"><Icon size={19} /></span>
              <h3 className="font-bold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}