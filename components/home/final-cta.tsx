import Link from "next/link";
import Image from "next/image";

// TODO: replace with confirmed profile URLs
const SOCIAL = {
    instagram: "https://www.instagram.com/usepetark",
    tiktok: "https://www.tiktok.com/@usepetark"
};

const quick = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
  { label: "Log In", href: "/login" },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const socials = [
  { label: "Instagram @usepetark", href: SOCIAL.instagram, Icon: InstagramIcon },
  { label: "TikTok @usepetark", href: SOCIAL.tiktok, Icon: TikTokIcon },
];

export default function Footer() {
  return (
    <footer className="bg-[#333333] text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" aria-label="PetArk home">
            <Image
              src="/petark_logo.png"
              alt="PetArk logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </Link>
          <p className="mt-3 text-sm font-semibold text-green-400 sec-ff">Every life, watched over.</p>
          <p className="mt-2 max-w-xs text-sm text-slate-400 pry-ff">Veterinary clinic management, made more organized.</p>
        </div>
        <nav aria-label="Quick links">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 sec-ff">Quick links</p>
          <ul className="space-y-2 text-sm pry-ff">
            {quick.map((l) => <li key={l.label}><Link href={l.href} className="hover:text-green-400">{l.label}</Link></li>)}
          </ul>
        </nav>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400 sec-ff">Follow us</p>
          <ul className="flex gap-3">
            {socials.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-slate-300 transition hover:border-green-400 hover:bg-green-500/10 hover:text-green-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
                >
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 sec-ff">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 Ark Foundry Ltd.</p>
          <p className="flex gap-4"><Link href="/privacy" className="hover:text-green-400">Privacy Policy</Link><Link href="/terms" className="hover:text-green-400">Terms of Service</Link></p>
        </div>
      </div>
    </footer>
  );
}