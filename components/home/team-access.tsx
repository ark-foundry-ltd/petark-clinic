import { ClipboardList, Lock, Stethoscope, UserCog } from "lucide-react";

const roles = [
  { icon: Stethoscope, role: "Veterinarians", text: "Clinical visits, patient history and treatment records.", areas: ["Clinical visits", "Patient history", "Treatments"] },
  { icon: ClipboardList, role: "Receptionists", text: "Patient registration and appointment management.", areas: ["Registration", "Appointments"] },
  { icon: UserCog, role: "Clinic administrators", text: "Staff permissions, inventory, sales and operational oversight.", areas: ["Permissions", "Inventory", "Sales"] },
];

export default function TeamAccess() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl pry-ff">Built for the people who run your clinic.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {roles.map(({ icon: Icon, role, text, areas }) => (
          <div key={role} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#D7F9E5] text-[#319C5A]"><Icon size={19} /></span>
              <h3 className="font-bold text-slate-800 pry-ff">{role}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500 sec-ff">{text}</p>
            <div className="mt-4 flex flex-wrap gap-1.5 pry-ff">
              {areas.map((a) => <span key={a} className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">{a}</span>)}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 pry-ff"><Lock size={14} /> Access depends on the permissions assigned to each team member.</p>
    </section>
  );
}