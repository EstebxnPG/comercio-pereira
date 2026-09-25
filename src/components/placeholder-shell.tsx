import Link from "next/link";

export function PlaceholderShell({
  actions,
  eyebrow,
  items,
  title,
}: {
  actions?: Array<{ href: string; label: string }>;
  eyebrow: string;
  items: string[];
  title: string;
}) {
  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <p className="text-sm font-black uppercase tracking-wide text-brand">
            {eyebrow}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            Espacio reservado para diseno e implementacion funcional.
          </p>
        </header>

        {actions && actions.length > 0 ? (
          <nav className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link
                className="md-outlined-button px-4"
                href={action.href}
                key={action.href}
              >
                {action.label}
              </Link>
            ))}
          </nav>
        ) : null}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold">Pendiente por definir</h2>
          <ul className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-stone-700">
            {items.map((item) => (
              <li
                className="rounded-xl border border-stone-200 bg-paper px-4 py-3"
                key={item}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
