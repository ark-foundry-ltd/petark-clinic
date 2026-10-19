import type { Metadata } from "next";
import PrivacyCard from "@/components/auth/privacy-card";

export const metadata: Metadata = {
  title: "Privacy Policy for Veterinary Clinics | PetArk",
  description:
    "How PetArk collects, uses, stores, and discloses information for veterinary clinics, staff, and pet owners, in line with the Nigeria Data Protection Act 2023.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy for Veterinary Clinics | PetArk",
    description:
      "How PetArk handles clinic, staff, and pet owner information.",
    url: "/privacy",
    siteName: "PetArk",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-clr">
      <PrivacyCard />
    </main>
  );
}