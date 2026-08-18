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
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
            Como funciona
          </p>
          <h2 className="mt-2 text-3xl font-black text-[#22211f]">
            Tres pasos, sin intermediarios
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((item) => (
            <article
              key={item.step}
              className="md-surface p-5"
            >
              <p className="text-sm font-black text-[#B3262E]">{item.step}</p>
              <h3 className="mt-3 text-2xl font-black text-[#22211f]">
                {item.title}
              </h3>
              <p className="mt-3 leading-7 text-stone-600">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
