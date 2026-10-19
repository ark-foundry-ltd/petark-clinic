import { Building2, Check, GitBranch, GraduationCap, Landmark, Lock, Share2 } from "lucide-react";

const audiences = [
  {
    icon: Building2,
    role: "Private clinics",
    text: "Run appointments, patient records, billing and stock from one place, whatever the size of your practice.",
    points: [
      "Remind clients of appointments by SMS",
      "Track stock and sales at the till",
      "Keep every patient's history in one record",
    ],
  },
  {
    icon: Landmark,
    role: "State and government hospitals",
    text: "Manage larger teams with role-based access, multiple locations and clear reporting.",
    points: [
      "Give each staff member the right level of access",
      "Run several locations under one account",
      "Report on visits, sales and stock",
    ],
  },
  {
    icon: GraduationCap,
    role: "Veterinary teaching hospitals",
    text: "Keep structured clinical records for every case, and receive referrals from other clinics.",
    points: [
      "Record structured SOAP notes for every case",
      "Track lab results and vaccinations per patient",
      "Receive referrals from other clinics",
    ],
  },
  {
    icon: Share2,
    role: "Specialist and referral centres",
    text: "Receive patients referred by other clinics on the platform, and stay on top of every case.",
    points: [
      "Get referrals from clinics across PetArk",
      "Accept or decline each referral",
      "Get notified by push and email",
    ],
  },
  {
    icon: GitBranch,
    role: "Multi-branch clinic groups",
    text: "Run several branches under one account, with stock, sales and reports for each location.",
    points: [
      "Manage stock separately at each location",
      "Track sales per branch",
      "See reports for each branch",
    ],
  },
];

export default function WhoUsesPetArk() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#333333] sm:text-4xl pry-ff">Built for every kind of veterinary practice.</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {audiences.map(({ icon: Icon, role, text, points }) => (
          <div key={role} className="w-full rounded-2xl border border-slate-200 bg-white p-5 md:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.7rem)]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#D7F9E5] text-[#319C5A]"><Icon size={19} /></span>
              <h3 className="font-bold text-slate-800 pry-ff">{role}</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500 sec-ff">{text}</p>
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 pry-ff">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-[13px] font-medium text-slate-700">
                  <Check size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-[#319C5A]" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500 pry-ff"><Lock size={14} /> Each clinic's data is kept separate and private.</p>
    </section>
  );
}