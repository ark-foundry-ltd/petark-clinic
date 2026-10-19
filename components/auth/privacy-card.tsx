import LegalCard, { type LegalSection } from "./legal-card";

const intro = [
  "PetArk is operated by Ark Foundry Ltd (“PetArk”, “we”, “us” or “our”). This Privacy Policy explains how we collect, use, store, and disclose information when veterinary clinics and their authorised users use PetArk.",
  "We aim to handle personal information responsibly and in accordance with the Nigeria Data Protection Act 2023 and other applicable laws.",
];

const sections: LegalSection[] = [
  {
    id: "information-we-process",
    title: "Information We Process",
    blocks: [
      {
        type: "p",
        text: "Depending on how the service is used, information may include:",
      },
      {
        type: "list",
        items: [
          {
            label: "Clinic account information",
            text: "Clinic name, address, registration details, contact information, and verification documents.",
          },
          {
            label: "Staff information",
            text: "Names, email addresses, roles, account credentials, and access activity.",
          },
          {
            label: "Pet owner information",
            text: "Names, telephone numbers, email addresses, and other contact details entered by clinics.",
          },
          {
            label: "Clinical and operational records",
            text: "Pet profiles, visit history, clinical notes, examination findings, laboratory results, treatments, vaccinations, appointments, inventory, and sales records.",
          },
          {
            label: "Subscription and payment information",
            text: "Selected plan, billing history, transaction references, payment status, and related records. Payment card details are handled according to the payment processor’s integration and are not necessarily stored by PetArk.",
          },
          {
            label: "Technical information",
            text: "Log data, device and browser information, security events, and information required to maintain and troubleshoot the service.",
          },
        ],
      },
    ],
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    blocks: [
      { type: "p", text: "We process information as necessary to:" },
      {
        type: "list",
        items: [
          { label: "Accounts", text: "Create, verify, and manage clinic accounts." },
          { label: "Records", text: "Provide patient records and clinical management features." },
          {
            label: "Scheduling",
            text: "Manage appointments, treatments, laboratory results, and reminders.",
          },
          { label: "Billing", text: "Process subscriptions and payments." },
          {
            label: "Communication",
            text: "Send service-related notifications and account communications.",
          },
          {
            label: "Support",
            text: "Provide customer support and troubleshoot technical issues.",
          },
          {
            label: "Security",
            text: "Protect accounts, detect misuse, and maintain system security.",
          },
          {
            label: "Legal",
            text: "Meet applicable legal and regulatory obligations.",
          },
          {
            label: "Improvement",
            text: "Improve service reliability and functionality using appropriate safeguards.",
          },
        ],
      },
      {
        type: "p",
        text: "We do not sell clinic or pet owner personal information as a business model.",
      },
    ],
  },
  {
    id: "clinics-and-pet-owners",
    title: "Clinics and Pet Owner Information",
    blocks: [
      {
        type: "p",
        text: "Clinics generally determine why and how their pet owners’ personal information is collected and used for veterinary services. Depending on the circumstances, the clinic may act as a data controller and PetArk may process that information on the clinic’s instructions.",
      },
      {
        type: "p",
        text: "PetArk separately processes information needed to manage its relationship with clinics, including accounts, subscriptions, support, and billing.",
      },
      {
        type: "p",
        text: "Clinics are responsible for ensuring that they have an appropriate lawful basis to enter and use personal information, provide required privacy notices, and comply with their own legal and professional obligations.",
      },
    ],
  },
  {
    id: "legal-grounds",
    title: "Legal Grounds for Processing",
    blocks: [
      {
        type: "p",
        text: "Where required, we rely on an appropriate lawful basis under applicable data protection law. Depending on the purpose, this may include contractual necessity, compliance with a legal obligation, legitimate interests assessed against individual rights, or consent where required.",
      },
      {
        type: "p",
        text: "Where consent is the applicable basis, it may be withdrawn subject to legal and operational limitations. Withdrawal does not invalidate processing lawfully performed before withdrawal.",
      },
    ],
  },
  {
    id: "service-providers",
    title: "Service Providers and Disclosure",
    blocks: [
      {
        type: "p",
        text: "We may share relevant information with service providers that help us operate PetArk, such as hosting and infrastructure providers, messaging providers, payment processors, email services, and file-storage providers.",
      },
      {
        type: "p",
        text: "These providers receive information as necessary for their functions and are subject to applicable contractual, confidentiality, and data protection requirements.",
      },
      {
        type: "p",
        text: "We may also disclose information when required by law, to respond to lawful requests, to protect the security of the service, or to establish or defend legal claims.",
      },
      {
        type: "p",
        text: "We do not authorise third-party service providers to use clinic records for unrelated purposes merely because those records are processed through PetArk.",
      },
    ],
  },
  {
    id: "sms-notifications",
    title: "SMS and Notifications",
    blocks: [
      {
        type: "p",
        text: "Where enabled, PetArk may use a messaging provider to deliver appointment reminders, treatment reminders, and other service-related notifications using contact details supplied by the clinic.",
      },
      {
        type: "p",
        text: "Delivery depends on the accuracy of the contact information, network conditions, provider availability, and applicable messaging rules.",
      },
      {
        type: "p",
        text: "Clinics must ensure that reminders are sent lawfully and that they have the appropriate authority to use the recipients’ contact details.",
      },
    ],
  },
  {
    id: "security-retention",
    title: "Security and Retention",
    blocks: [
      {
        type: "p",
        text: "We use appropriate technical and organisational measures intended to protect information against unauthorised access, alteration, disclosure, loss, or destruction.",
      },
      {
        type: "p",
        text: "No online service can guarantee absolute security. Clinics must protect their login credentials, manage staff permissions, and promptly report suspected unauthorised access.",
      },
      {
        type: "p",
        text: "We retain information for as long as reasonably necessary to provide the service, maintain clinical and financial records, resolve disputes, meet legal obligations, and protect legitimate interests. Retention periods depend on the type of information and the applicable requirements.",
      },
      {
        type: "p",
        text: "When information is no longer required, it will be deleted, anonymised, or otherwise handled appropriately, subject to legal retention obligations and legitimate backup or security requirements.",
      },
    ],
  },
  {
    id: "data-transfers",
    title: "Data Transfers",
    blocks: [
      {
        type: "p",
        text: "Some service providers may process or store information outside Nigeria. Where applicable, such transfers will be subject to the requirements and safeguards imposed by Nigerian data protection law.",
      },
      {
        type: "p",
        text: "Further details about relevant providers and transfers may be obtained by contacting us.",
      },
    ],
  },
  {
    id: "privacy-rights",
    title: "Privacy Rights and Requests",
    blocks: [
      {
        type: "p",
        text: "Depending on the applicable law and circumstances, individuals may have rights to request access to their personal information, correction of inaccurate information, deletion, restriction of processing, objection to certain processing, data portability, or withdrawal of consent.",
      },
      {
        type: "p",
        text: "Requests relating to information controlled by a clinic should generally be directed to that clinic. Requests concerning information for which PetArk is responsible may be sent to PetArk.",
      },
      {
        type: "p",
        text: "We may need to verify the identity and authority of the person making a request. Some requests may be limited by legal obligations, recordkeeping requirements, or the rights of others.",
      },
      {
        type: "p",
        text: "Individuals may also lodge complaints with the Nigeria Data Protection Commission where applicable.",
      },
    ],
  },
  {
    id: "changes-contact",
    title: "Changes and Contact",
    blocks: [
      {
        type: "p",
        text: "We may update this Privacy Policy when our services, processing activities, or legal obligations change. Material updates will be communicated through appropriate channels.",
      },
      {
        type: "p",
        text: "For privacy questions, data requests, or concerns, contact:",
      },
      {
        type: "contact",
        name: "Ark Foundry Ltd — PetArk",
        lines: [
          {
            label: "Privacy contact",
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

export default function PrivacyCard() {
  return (
    <LegalCard
      title="Privacy Policy for Veterinary Clinics"
      effectiveDate="19 October 2026"
      intro={intro}
      sections={sections}
      related={{ href: "/terms", label: "Terms of Service" }}
    />
  );
}