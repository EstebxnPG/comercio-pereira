import { INCLUSION_WHATSAPP } from "@/lib/constants";

export function SubmitCtaSection() {
  return (
    <section id="sumar-comercio" className="bg-paper py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-brand px-6 py-8 text-white shadow-md sm:px-10 sm:py-10">
          <div
            aria-hidden="true"
            className="absolute -bottom-10 -right-10 size-32 rounded-full bg-gold opacity-40 blur-sm"
          />
          <div className="relative sm:max-w-xl">
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
              Tu negocio aun no esta aqui?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
              La inclusion es gratuita y verificada, revisamos cada comercio
              antes de publicarlo.
            </p>
            {INCLUSION_WHATSAPP ? (
              <a
                href={`https://wa.me/${INCLUSION_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-black text-brand-deep shadow-md transition hover:bg-white/90 sm:w-auto"
              >
                Solicitar inclusion
              </a>
            ) : (
              <p className="mt-5 rounded-lg border border-white/25 bg-white/10 p-3 text-sm font-semibold text-white/90">
                Canal de inclusion pendiente de confirmar.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
