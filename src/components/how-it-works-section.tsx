const steps = [
  {
    step: "01",
    title: "Encuentra",
    text: "Busca por nombre, categoria o descripcion y filtra por estado de atencion.",
  },
  {
    step: "02",
    title: "Revisa",
    text: "Abre el perfil para confirmar ubicacion, horario, redes y canales disponibles.",
  },
  {
    step: "03",
    title: "Contacta",
    text: "Escribe por WhatsApp, llama o comparte el perfil con alguien que pueda comprar.",
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
          <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl border border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] p-4"
            >
              <p className="font-mono text-xs font-bold text-brand-deep">{item.step}</p>
              <h3 className="mt-2 font-display text-lg font-bold text-ink">
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
