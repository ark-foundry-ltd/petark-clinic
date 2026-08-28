// components/staff-dashboard/referrals-section.tsx
import ListReferrals from "@/components/clinic/list-referrals";

export default function ReferralsSection() {
  return (
    <ListReferrals createVisitBasePath="/staff-dashboard/clinical/records/create-visit" />
  );
}