"use client";

import { useId, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

const CONTACT_EMAIL = "hello@usepetark.com";

const SIZES = ["1 location", "2 to 5 locations", "6 or more locations", "Not sure yet"] as const;

interface FormState {
  name: string;
  organisation: string;
  email: string;
  phone: string;
  size: string;
  message: string;
}

const EMPTY: FormState = { name: "", organisation: "", email: "", phone: "", size: SIZES[0], message: "" };

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [sent, setSent] = useState(false);

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  function validate() {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.organisation.trim()) next.organisation = "Please enter your clinic or organisation.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Please enter a valid email address.";
    if (!form.message.trim()) next.message = "Tell us a little about what you need.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // No backend needed: this opens the visitor's email app with the message filled in.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const subject = `Enterprise enquiry: ${form.organisation.trim()}`;
    const body = [
      `Name: ${form.name.trim()}`,
      `Clinic or organisation: ${form.organisation.trim()}`,
      `Email: ${form.email.trim()}`,
      form.phone.trim() ? `Phone: ${form.phone.trim()}` : null,
      `Size: ${form.size}`,
      "",
      form.message.trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center sm:p-10" role="status">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#D7F9E5] text-[#319C5A]"><CheckCircle2 size={24} /></span>
        <h2 className="sec-ff mt-5 text-xl font-extrabold text-slate-900">Your email is ready to send</h2>
        <p className="pry-ff mx-auto mt-2 max-w-sm text-sm text-slate-500">
          We opened a message to {CONTACT_EMAIL} in your email app. Press send there and we&apos;ll get back to you.
        </p>
        <p className="pry-ff mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Nothing opened? Email us directly at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#319C5A] hover:underline">{CONTACT_EMAIL}</a>.
        </p>
        <button type="button" onClick={() => setSent(false)} className="sec-ff mt-6 text-sm font-semibold text-slate-700 hover:text-[#319C5A]">
          Edit message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required value={form.name} onChange={set("name")} error={errors.name} autoComplete="name" />
        <Field label="Clinic or organisation" required value={form.organisation} onChange={set("organisation")} error={errors.organisation} autoComplete="organization" />
        <Field label="Email" type="email" required value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" />
        <Field label="Phone" type="tel" hint="Optional" value={form.phone} onChange={set("phone")} autoComplete="tel" />
      </div>

      <div className="mt-5">
        <SelectField label="How many locations do you run?" value={form.size} onChange={set("size")} options={SIZES} />
      </div>

      <div className="mt-5">
        <TextAreaField label="How can we help?" required value={form.message} onChange={set("message")} error={errors.message} placeholder="Tell us about your clinic, your team size and what you'd like PetArk to do for you." />
      </div>

      <button type="submit" className="sec-ff mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 sm:w-auto">
        <Send size={15} /> Send message
      </button>
    </form>
  );
}

/* ---------------------------- Fields ---------------------------- */

const inputBase =
  "pry-ff w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2";
const inputOk = "border-slate-200 focus:border-green-500 focus:ring-green-500/30";
const inputBad = "border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-red-200";

function Label({ id, text, required, hint }: { id: string; text: string; required?: boolean; hint?: string }) {
  return (
    <label htmlFor={id} className="sec-ff mb-1.5 block text-xs font-bold text-slate-700">
      {text}
      {required && <span className="text-red-500"> *</span>}
      {hint && <span className="font-normal text-slate-400"> ({hint})</span>}
    </label>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return <p id={id} className="pry-ff mt-1.5 text-xs text-red-600">{error}</p>;
}

function Field({
  label, value, onChange, error, type = "text", required, hint, autoComplete,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string;
  type?: string; required?: boolean; hint?: string; autoComplete?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label id={id} text={label} required={required} hint={hint} />
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} ${error ? inputBad : inputOk}`} />
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  const id = useId();
  return (
    <div>
      <Label id={id} text={label} />
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputBase} ${inputOk}`}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextAreaField({
  label, value, onChange, error, required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; error?: string; required?: boolean; placeholder?: string;
}) {
  const id = useId();
  return (
    <div>
      <Label id={id} text={label} required={required} />
      <textarea id={id} rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}
        className={`${inputBase} min-h-32 resize-y leading-relaxed ${error ? inputBad : inputOk}`} />
      <ErrorText id={`${id}-error`} error={error} />
    </div>
  );
}