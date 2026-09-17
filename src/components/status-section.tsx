import { STATUS_DESCRIPTIONS, STATUS_LABELS } from "@/lib/constants";

export function StatusSection() {
  return (
    <section className="bg-paper py-10 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-brand">
            Estados de atencion
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Informacion clara antes de contactar
          </h2>
          <p className="mt-4 leading-7 text-stone-600">
            Cada comercio indica como esta atendiendo. La plataforma da
            visibilidad y contacto; la compra se acuerda directamente con cada
            establecimiento.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(STATUS_LABELS).map(([status, label]) => (
            <div
              key={status}
              className="md-surface p-4"
            >
              <p className="font-display text-base font-bold text-ink">{label}</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {
                  STATUS_DESCRIPTIONS[
                    status as keyof typeof STATUS_DESCRIPTIONS
                  ]
                }
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
