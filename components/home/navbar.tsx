"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5" aria-label="Main">
        <Link href="/" aria-label="PetArk home">
            <Image
              src="/petark_logo.png"
              alt="PetArk logo"
              width={40}
              height={40}
              className="object-cover"
            />
        </Link>

        <ul className="hidden gap-9 text-sm font-semibold text-slate-500 md:flex pry-ff">
          {links.map((l) => (
            <li key={l.href}><a href={l.href} className="transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-green-500">{l.label}</a></li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden px-3 text-sm font-semibold text-slate-700 hover:text-slate-900 md:block pry-ff">Sign in</Link>
          <Link href="/signup" className="hidden rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 md:block pry-ff">
            Get Started
          </Link>
          <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu" className="ml-1 grid h-10 w-10 place-items-center rounded-lg border border-slate-200 md:hidden">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 pb-4 md:hidden">
          {[...links, { label: "sign in", href: "/login" }].map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700 pry-ff">{l.label}</a>
          ))}
          <Link href="/signup" onClick={() => setOpen(false)} className="mt-4 block rounded-lg bg-green-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-600 pry-ff">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}