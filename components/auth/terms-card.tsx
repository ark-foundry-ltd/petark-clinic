import LegalCard, { type LegalSection } from "./legal-card";

const intro = [
  "These Terms of Service govern the use of PetArk by veterinary clinics and their authorised users. PetArk is operated by Ark Foundry Ltd (“PetArk”, “we”, “us” or “our”).",
  "By registering a clinic account or using PetArk, you agree to these terms on behalf of yourself and, where applicable, the clinic you represent. If you do not agree, do not use the service.",
];

const sections: LegalSection[] = [
  {
    id: "the-service",
    title: "The Service",
    blocks: [
      {
        type: "p",
        text: "PetArk provides veterinary clinic management software to support patient registration, clinical records, appointments, consultations, examination findings, laboratory results, treatments, inventory, sales, reminders, and other features available under a clinic’s subscription plan.",
      },
      {
        type: "p",
        text: "Features may vary by subscription plan. We may improve or update the service over time while taking reasonable steps to preserve existing functionality and data.",
      },
    ],
  },
  {
    id: "clinic-accounts",
    title: "Clinic Accounts and Responsibilities",
    blocks: [
      {
        type: "p",
        text: "The clinic is responsible for providing accurate registration information, maintaining the security of its account, managing staff access, and ensuring that users have appropriate permissions.",
      },
      {
        type: "p",
        text: "Clinics must ensure that personal information and clinical records are collected and used lawfully, that appropriate permissions or other lawful grounds exist for processing, and that pet owners receive any required privacy information.",
      },
      {
        type: "p",
        text: "Clinics are responsible for the accuracy of the information they enter, the professional conduct of their staff, and the clinical decisions made using the platform.",
      },
    ],
  },
  {
    id: "clinical-responsibility",
    title: "Clinical Responsibility",
    blocks: [
      {
        type: "p",
        text: "PetArk is a software platform, not a substitute for professional veterinary judgement.",
      },
      {
        type: "p",
        text: "Veterinarians remain responsible for examining patients, interpreting findings, confirming diagnoses, ordering and interpreting tests, prescribing treatments, and determining appropriate care.",
      },
      {
        type: "p",
        text: "Where AI-assisted features are available, their outputs are informational suggestions and may be incomplete or inaccurate. They must be reviewed by a qualified professional before being relied upon. PetArk does not guarantee a particular clinical outcome.",
      },
    ],
  },
  {
    id: "subscriptions-payments",
    title: "Subscriptions and Payments",
    blocks: [
      {
        type: "p",
        text: "PetArk offers subscription plans with different features, usage limits, and billing arrangements. The applicable plan, price, and restrictions will be displayed when subscribing or upgrading.",
      },
      {
        type: "p",
        text: "Clinics are responsible for paying applicable subscription fees and other charges disclosed before purchase. Annual and monthly subscriptions are subject to the billing terms presented at checkout.",
      },
      {
        type: "p",
        text: "Where recurring billing is enabled, the applicable renewal terms will be disclosed before the clinic subscribes. Cancellation prevents future renewals according to the applicable billing terms but does not necessarily refund payments already made.",
      },
      {
        type: "p",
        text: "Refunds, failed payments, outstanding balances, and subscription downgrades will be handled according to the applicable plan terms and mandatory law.",
      },
    ],
  },
  {
    id: "sms-third-party",
    title: "SMS and Third-Party Services",
    blocks: [
      {
        type: "p",
        text: "SMS reminders and other integrated services may depend on external providers, network availability, and the clinic’s subscription entitlements.",
      },
      {
        type: "p",
        text: "Delivery may be delayed or fail because of circumstances outside PetArk’s reasonable control. Clinics must maintain accurate contact information and use messaging features lawfully.",
      },
      {
        type: "p",
        text: "Payment processors, hosting providers, messaging providers, and other third-party services may have their own terms and privacy practices.",
      },
    ],
  },
  {
    id: "data-ownership-privacy",
    title: "Data Ownership and Privacy",
    blocks: [
      {
        type: "p",
        text: "Clinics retain their rights in the clinic data and clinical records they submit to PetArk, subject to applicable law and the rights of other persons.",
      },
      {
        type: "p",
        text: "Clinics authorise PetArk to process such information as reasonably necessary to provide, secure, maintain, and support the service and to fulfil applicable legal obligations.",
      },
      {
        type: "p",
        text: "PetArk will handle personal information in accordance with its Privacy Policy and applicable data protection law. Clinics remain responsible for their own obligations concerning the personal information they collect from pet owners and other individuals.",
      },
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    blocks: [
      {
        type: "p",
        text: "Clinics and users must not misuse the service, attempt unauthorised access, interfere with its security, upload unlawful content, share accounts inappropriately, or use PetArk to violate another person’s rights or applicable law.",
      },
      {
        type: "p",
        text: "We may restrict or suspend access where reasonably necessary to investigate security incidents, prevent abuse, enforce these terms, or comply with legal requirements. Where appropriate, we will provide notice and an opportunity to address the issue.",
      },
    ],
  },
  {
    id: "availability-limitations",
    title: "Availability and Limitations",
    blocks: [
      {
        type: "p",
        text: "We aim to maintain a reliable service but do not guarantee uninterrupted or error-free operation. Maintenance, connectivity issues, third-party outages, and other technical circumstances may affect availability.",
      },
      {
        type: "p",
        text: "Clinics should maintain appropriate professional records and operational contingency procedures. PetArk does not replace a clinic’s responsibility to comply with applicable veterinary, recordkeeping, and professional requirements.",
      },
      {
        type: "p",
        text: "To the extent permitted by law, PetArk is not responsible for indirect losses arising from use of the service, inaccurate information entered by users, or clinical decisions made by a clinic. Nothing in these terms excludes liability that cannot lawfully be excluded.",
      },
    ],
  },
  {
    id: "suspension-termination",
    title: "Suspension, Termination and Changes",
    blocks: [
      {
        type: "p",
        text: "Clinics may discontinue use of PetArk subject to their subscription terms and any outstanding payment obligations.",
      },
      {
        type: "p",
        text: "We may suspend or terminate access for material breach, non-payment, misuse, security risks, or legal requirements, subject to applicable law.",
      },
      {
        type: "p",
        text: "When access ends, data access, export, retention, and deletion will be handled in accordance with the applicable subscription terms, our Privacy Policy, and legal obligations.",
      },
      {
        type: "p",
        text: "We may update these terms from time to time. Material changes will be communicated through appropriate channels. Continued use after the effective date of revised terms constitutes acceptance where permitted by law.",
      },
    ],
  },
  {
    id: "governing-law-contact",
    title: "Governing Law and Contact",
    blocks: [
      {
        type: "p",
        text: "These terms are governed by the laws of the Federal Republic of Nigeria. Disputes are subject to the jurisdiction of the competent Nigerian courts, subject to applicable law.",
      },
      { type: "p", text: "For questions about these terms, contact:" },
      {
        type: "contact",
        name: "Ark Foundry Ltd — PetArk",
        lines: [
          {
            label: "Email",
            value: "hello@usepetark.com",
            href: "mailto:hello@usepetark.com",
          },
          {
            label: "Website",
            value: "https://usepetark.com",
            href: "https://usepetark.com",
          },
        ],
      },
    ],
  },
];

export default function TermsCard() {
  return (
    <LegalCard
      title="Terms of Service for Veterinary Clinics"
      effectiveDate="19 October 2026"
      intro={intro}
      sections={sections}
      related={{ href: "/privacy", label: "Privacy Policy" }}
    />
  );
}