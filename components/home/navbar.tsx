"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";

const OWNER_PORTAL_URL =
  process.env.NEXT_PUBLIC_OWNER_APP_URL ?? "https://app.usepetark.com";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const signInOptions = [
  { label: "Veterinarian / Clinic", href: "/login", external: false },
  { label: "Pet owner", href: `${OWNER_PORTAL_URL}/login`, external: true },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const signInRef = useRef<HTMLDivElement>(null);

  // close the dropdown on outside click or Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (signInRef.current && !signInRef.current.contains(e.target as Node)) {
        setSignInOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSignInOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
            <li key={l.href}>
              <a href={l.href} className="transition hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-green-500">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Desktop sign-in dropdown */}
          <div ref={signInRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setSignInOpen((v) => !v)}
              aria-expanded={signInOpen}
              aria-haspopup="menu"
              className="flex items-center gap-1 px-3 text-sm font-semibold text-slate-700 hover:text-slate-900 pry-ff"
            >
              Sign in
              <ChevronDown size={16} className={`transition ${signInOpen ? "rotate-180" : ""}`} />
            </button>

            {signInOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-slate-100 bg-white shadow-lg"
              >
                {signInOptions.map((o) =>
                  o.external ? (
                    <a
                      key={o.href}
                      href={o.href}
                      role="menuitem"
                      onClick={() => setSignInOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 pry-ff"
                    >
                      {o.label}
                    </a>
                  ) : (
                    <Link
                      key={o.href}
                      href={o.href}
                      role="menuitem"
                      onClick={() => setSignInOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 pry-ff"
                    >
                      {o.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <Link
            href="/signup"
            className="hidden rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 md:block pry-ff"
          >
            Get Started
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="ml-1 grid h-10 w-10 place-items-center rounded-lg border border-slate-200 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-5 pb-4 md:hidden">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700 pry-ff"
            >
              {l.label}
            </a>
          ))}

          <p className="pt-4 text-xs font-semibold uppercase tracking-wide text-slate-400 pry-ff">Sign in as</p>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700 pry-ff"
          >
            Veterinarian / Clinic
          </Link>
          <a
            href={`${OWNER_PORTAL_URL}/login`}
            onClick={() => setOpen(false)}
            className="block border-b border-slate-100 py-3 text-sm font-semibold text-slate-700 pry-ff"
          >
            Pet owner
          </a>

          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-lg bg-green-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-600 pry-ff"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}