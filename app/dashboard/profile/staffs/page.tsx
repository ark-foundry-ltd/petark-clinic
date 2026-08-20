// dashboard/profile/staffs/page.tsx

import { Metadata } from "next";
import StaffsClient from "@/components/clinic/staffs-client";

export const metadata: Metadata = {
  title: "Staff | PetArk",
  description: "Manage the staffs for this clinic",
};

export default function StaffsPage() {
  return <StaffsClient />;
}