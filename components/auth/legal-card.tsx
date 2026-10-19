import Link from "next/link";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: { label: string; text: string }[] }
  | { type: "contact"; name: string; lines: { label: string; value: string; href?: string }[] };

export interface LegalSection {
  id: string;
  title: string;
  blocks: LegalBlock[];
}

interface LegalCardProps {
  title: string;
  effectiveDate: string;
  intro: string[];
  sections: LegalSection[];
  related: { href: string; label: string };
}

export default function LegalCard({
  title,
  effectiveDate,
  intro,
  sections,
  related,
}: Readonly<LegalCardProps>) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16 sec-ff">
      <header className="mb-10 max-w-3xl">
        <Link
          href="/signup"
          className="text-sm font-sec-ff text-neutral-600 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-acc-clr"
        >
          Back to PetArk
        </Link>
        <h1 className="mt-4 font-pry-ff text-3xl font-semibold text-acc-clr sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 font-sec-ff text-sm text-neutral-600">
          Effective {effectiveDate}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav
          aria-label="Sections"
          className="hidden lg:block lg:sticky lg:top-8 lg:self-start"
        >
          <ol className="space-y-2 border-l border-neutral-200 pl-4 font-sec-ff text-sm">
            {sections.map((section, i) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-neutral-600 hover:text-sec-clr focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc-clr"
                >
                  {i + 1}. {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10">
          <div className="space-y-4 border-b border-neutral-200 pb-8 font-sec-ff leading-7 text-neutral-700">
            {intro.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>

          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-8 border-b border-neutral-200 py-8 last:border-b-0 last:pb-0"
            >
              <h2 className="font-pry-ff text-xl font-semibold text-acc-clr">
                {i + 1}. {section.title}
              </h2>
              <div className="mt-4 space-y-4 font-sec-ff leading-7 text-neutral-700">
                {section.blocks.map((block, j) => {
                  if (block.type === "p") {
                    return <p key={j}>{block.text}</p>;
                  }
                  if (block.type === "list") {
                    return (
                      <ul key={j} className="list-disc space-y-2 pl-5 marker:text-acc-clr">
                        {block.items.map((item) => (
                          <li key={item.label}>
                            <span className="font-semibold text-sec-clr">{item.label}:</span>{" "}
                            {item.text}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <address
                      key={j}
                      className="rounded-xl bg-bg-clr p-4 not-italic"
                    >
                      <p className="font-semibold text-sec-clr">{block.name}</p>
                      {block.lines.map((line) => (
                        <p key={line.label}>
                          {line.label}:{" "}
                          {line.href ? (
                            <a
                              href={line.href}
                              className="text-acc-clr underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc-clr"
                            >
                              {line.value}
                            </a>
                          ) : (
                            line.value
                          )}
                        </p>
                      ))}
                    </address>
                  );
                })}
              </div>
            </section>
          ))}
        </article>
      </div>

      <p className="mt-8 font-sec-ff text-sm text-neutral-600">
        Also read our{" "}
        <Link
          href={related.href}
          className="text-acc-clr underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-acc-clr"
        >
          {related.label}
        </Link>
        .
      </p>
    </div>
  );
}