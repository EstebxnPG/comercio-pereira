import { FoundersLogos } from "@/components/founders-logos";
import { FOOTER_TEXT, INCLUSION_WHATSAPP } from "@/lib/constants";

export function InitiativeSection() {
  return (
    <section className="bg-[#22211f] py-10 text-white sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-black uppercase text-[#f5c84c]">
            Confianza local
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">
            Una vitrina neutral para el comercio de Pereira.
          </h2>
          <p className="mt-4 max-w-3xl leading-7 text-stone-300">
            {FOOTER_TEXT}
          </p>
          <div className="mt-6">
            <FoundersLogos variant="dark" />
          </div>
        </div>
        <div id="sumar-comercio" className="rounded-2xl border border-white/15 bg-white/[0.06] p-5">
          <h3 className="text-xl font-black">Tu negocio todavia no esta aqui?</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Por ahora la inclusion es privada y verificada. Esto evita datos
            falsos, perfiles duplicados y comercios sin autorizacion.
          </p>
          {INCLUSION_WHATSAPP ? (
            <a
              href={`https://wa.me/${INCLUSION_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="md-tonal-button mt-5 px-5 text-sm focus:ring-offset-[#7F1D1D]"
            >
              Solicitar inclusion
            </a>
          ) : (
            <p className="mt-5 rounded-lg border border-white/15 bg-white/5 p-3 text-sm font-semibold text-stone-200">
              Canal de inclusion pendiente de confirmar.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
