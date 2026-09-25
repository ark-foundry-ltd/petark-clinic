// src/components/onboarding-steps.tsx

import {
  ClipboardList,
  CalendarClock,
  PackageSearch,
  HeartPulse,
  Syringe,
  Share2,
  MessageSquare,
  Radar,
  TrendingDown,
} from "lucide-react";
import {
  ClinicSyncCard,
  PatientRecordCard,
  QueueCard,
} from "./onboarding-floating-cards";

export type Feature = {
  icon: React.ElementType;
  label: string;
};

export type StepConfig = {
  id: number;
  eyebrow: string;
  heading: string;
  description: string;
  features: Feature[];
  imageAlt: string;
  imageSrc: string;
  liveTag: string;
  floatingCard: React.ReactNode;
  ctaLabel: string;
};

export const steps: StepConfig[] = [
  {
    id: 1,
    eyebrow: "Unified Clinic Operating System",
    heading: "Run your clinic in one place",
    description:
      "Manage appointments, patients, records, and more from one simple system designed for modern veterinary care teams.",
    features: [
      { icon: HeartPulse, label: "Patients & Records" },
      { icon: CalendarClock, label: "Appointments & Scheduling" },
      { icon: PackageSearch, label: "Inventory & POS" },
    ],
    imageAlt: "Veterinarian examining a golden retriever in clinic",
    imageSrc: "doc_with_dog.png",
    liveTag: "Live Clinic Sync",
    floatingCard: <ClinicSyncCard />,
    ctaLabel: "Continue",
  },
  {
    id: 2,
    eyebrow: "Clinical Care & Records",
    heading: "Keep every patient record organized",
    description:
      "Access medical history, visits, treatments, vaccinations, and follow-ups whenever you need them. Built for precision veterinary workflows without the clutter.",
    features: [
      { icon: ClipboardList, label: "Complete longitudinal health timeline" },
      { icon: Syringe, label: "One-click vaccination & treatment logs" },
      { icon: Share2, label: "Instant digital records sharing with pet owners" },
    ],
    imageAlt: "Vet technician updating patient records with a cat",
    imageSrc: "doc_with_Cat.png",
    liveTag: "Live Chart Syncing",
    floatingCard: <PatientRecordCard />,
    ctaLabel: "Next",
  },
  {
    id: 3,
    eyebrow: "Clinic Scheduling & Queue",
    heading: "Stay on top of every appointment",
    description:
      "Keep your clinic organized with scheduling, reminders, and clear appointment information.",
    features: [
      { icon: MessageSquare, label: "Automated SMS & WhatsApp reminders" },
      { icon: Radar, label: "Real-time daily agenda & exam room queue" },
      { icon: TrendingDown, label: "Reduce no-shows by up to 45%" },
    ],
    imageAlt: "Receptionist at the front desk of a veterinary clinic",
    imageSrc: "doc_with_Client.png",
    liveTag: "Reception Desk Live",
    floatingCard: <QueueCard />,
    ctaLabel: "Get Started",
  },
];