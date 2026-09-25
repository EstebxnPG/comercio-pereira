const steps = [
  {
    title: "Encuentra",
    text: "Busca por nombre, categoria o descripcion y filtra por estado de atencion.",
    Icon: SearchIcon,
  },
  {
    title: "Revisa",
    text: "Abre el perfil para confirmar ubicacion, horario, redes y canales disponibles.",
    Icon: CheckIcon,
  },
  {
    title: "Contacta",
    text: "Escribe por WhatsApp, llama o comparte el perfil con alguien que pueda comprar.",
    Icon: PhoneIcon,
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-brand">
              Como funciona
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
              Encuentra, revisa y contacta directo.
            </h2>
          </div>

          <div className="flex flex-col sm:hidden">
            {steps.map((item, index) => (
              <div key={item.title} className="relative flex gap-4 pb-8 last:pb-0">
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.375rem] top-[2.9rem] bottom-0 w-px bg-[var(--md-outline-variant)]"
                  />
                ) : null}
                <span className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full bg-brand shadow-sm">
                  <item.Icon className="size-5 text-white" />
                </span>
                <div className="pt-1">
                  <h3 className="font-display text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden gap-3 sm:grid sm:grid-cols-3">
            {steps.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] p-4"
              >
                <span className="grid size-10 place-items-center rounded-full bg-brand shadow-sm">
                  <item.Icon className="size-5 text-white" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
