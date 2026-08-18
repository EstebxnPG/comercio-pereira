import { FoundersLogos } from "@/components/founders-logos";
import { FOOTER_TEXT, INCLUSION_WHATSAPP } from "@/lib/constants";

export function InitiativeSection() {
  return (
    <section className="bg-[#7F1D1D] py-12 text-white sm:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#f5c84c]">
            Iniciativa
          </p>
          <h2 className="mt-2 text-3xl font-black">
            Una vitrina neutral para mover el comercio local
          </h2>
          <p className="mt-5 max-w-3xl leading-8 text-stone-200">
            {FOOTER_TEXT}
          </p>
          <div className="mt-6">
            <FoundersLogos variant="dark" />
          </div>
        </div>
        <div id="sumar-comercio" className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-lg">
          <h3 className="text-2xl font-black">Tienes un comercio aliado?</h3>
          <p className="mt-3 leading-7 text-stone-200">
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
