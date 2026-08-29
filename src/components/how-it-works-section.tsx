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
    <section className="bg-[#fffdf8] py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase text-[#B3262E]">
              Como funciona
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-[#22211f] sm:text-3xl">
              Encuentra, revisa y contacta directo.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((item) => (
            <article
              key={item.step}
              className="rounded-2xl border border-stone-200 bg-white p-4"
            >
              <p className="text-xs font-black text-[#B3262E]">{item.step}</p>
              <h3 className="mt-2 text-lg font-black text-[#22211f]">
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
