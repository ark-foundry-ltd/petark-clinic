import type { Metadata } from "next";
import TermsCard from "@/components/auth/terms-card";

export const metadata: Metadata = {
  title: "Terms of Service for Veterinary Clinics | PetArk",
  description:
    "The terms that govern how veterinary clinics and their staff use PetArk, including accounts, subscriptions, SMS reminders, clinical responsibility, and data ownership.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service for Veterinary Clinics | PetArk",
    description:
      "The terms that govern how veterinary clinics and their staff use PetArk.",
    url: "/terms",
    siteName: "PetArk",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-bg-clr">
      <TermsCard />
    </main>
  );
}