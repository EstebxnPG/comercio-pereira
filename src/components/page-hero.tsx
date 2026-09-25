import Link from "next/link";

export function PageHero({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-sm font-black uppercase tracking-wide text-brand">
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-extrabold leading-tight text-ink sm:mt-4 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-700">
          {description}
        </p>
        {primaryHref && primaryLabel ? (
          <Link
            href={primaryHref}
            className="md-tonal-button mt-8 px-5 text-sm"
          >
            {primaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
