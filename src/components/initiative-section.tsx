import { FoundersLogos } from "@/components/founders-logos";

export function InitiativeSection() {
  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-black uppercase tracking-wide text-brand">
          Confianza local
        </p>
        <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
          Una vitrina neutral para el comercio de Pereira.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
          Verificamos cada comercio antes de publicarlo, sin priorizar a quien
          paga mas.
        </p>
        <div className="mt-6">
          <FoundersLogos />
        </div>
      </div>
    </section>
  );
}
