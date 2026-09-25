// src/components/onboarding-floating-cards.tsx

import { Check, Wifi } from "lucide-react";

export function ClinicSyncCard() {
  return (
    <div className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 rounded-xl bg-pry-clr p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="sec-ff text-[13px] font-semibold text-sec-clr">
            Downtown Clinic
          </p>
          <p className="sec-ff text-xs text-sec-clr/60">PetArk Active Instance</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-acc-clr/10 px-2 py-1 text-[11px] font-medium text-acc-clr">
          <span className="h-1.5 w-1.5 rounded-full bg-acc-clr" />
          Active
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
        <div>
          <p className="sec-ff text-[11px] text-sec-clr/60">Today&apos;s Visits</p>
          <p className="pry-ff text-lg font-semibold text-sec-clr">
            18{" "}
            <span className="sec-ff text-[11px] font-normal text-acc-clr">
              +3 vs yesterday
            </span>
          </p>
        </div>
        <div>
          <p className="sec-ff text-[11px] text-sec-clr/60">Arrival Rate</p>
          <p className="pry-ff text-lg font-semibold text-sec-clr">
            98%{" "}
            <span className="sec-ff text-[11px] font-normal text-sec-clr/60">
              On schedule
            </span>
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3 text-[11px] text-sec-clr/70">
        <Check className="h-3.5 w-3.5 text-acc-clr" />
        All Systems Normal
      </div>
    </div>
  );
}

export function PatientRecordCard() {
  return (
    <div className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 rounded-xl bg-pry-clr p-4 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="sec-ff text-[13px] font-semibold text-sec-clr">
            Bella <span className="font-normal text-sec-clr/60">(Golden Retriever)</span>
          </p>
          <p className="sec-ff text-xs text-sec-clr/60">Visit Summary</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-acc-clr/10 px-2 py-1 text-[11px] font-medium text-acc-clr">
          <Check className="h-3 w-3" />
          Signed &amp; Finalized
        </span>
      </div>
      <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3 text-[12px] sec-ff">
        <p className="text-sec-clr/70">
          Diagnosis{" "}
          <span className="font-medium text-sec-clr">
            Routine Wellness &amp; DHPP Booster
          </span>
        </p>
        <p className="text-sec-clr/70">
          Next Due <span className="font-medium text-sec-clr">Oct 2026</span>
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-sec-clr/60 sec-ff">
        <span>Dr. A. Adebayo, DVM</span>
        <span className="flex items-center gap-1">
          <Wifi className="h-3 w-3 text-acc-clr" />
          Synced with Cloud EHR
        </span>
      </div>
    </div>
  );
}

export function QueueCard() {
  return (
    <div className="absolute -bottom-6 left-1/2 w-[86%] -translate-x-1/2 rounded-xl bg-pry-clr p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="sec-ff text-[13px] font-semibold text-sec-clr">
            Dr. Jenkins&apos; Agenda
          </p>
          <p className="sec-ff text-xs text-sec-clr/60">10:32 AM</p>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-sec-clr/70">
          Queue #04
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
        <div>
          <p className="sec-ff text-[12px] font-medium text-sec-clr">Max (Beagle)</p>
          <p className="sec-ff text-[11px] text-sec-clr/60">Ear Infection Check · Room 2</p>
        </div>
        <button className="rounded-lg bg-acc-clr px-3 py-1.5 text-[11px] font-medium text-pry-clr hover:bg-acc-clr/90 transition-all duration-200">
          Start Visit
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-acc-clr sec-ff">
        <Check className="h-3.5 w-3.5" />
        Checked In
      </div>
    </div>
  );
}