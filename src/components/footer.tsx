import Link from "next/link";
import { FoundersLogos } from "@/components/founders-logos";
import { FOOTER_TEXT, SITE_DESCRIPTOR, SITE_NAME } from "@/lib/constants";

const footerLinks = [
  { href: "/comercios", label: "Comercios" },
  { href: "/categorias", label: "Categorias" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/iniciativa", label: "Iniciativa" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-[#fffdf8]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-stone-600 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#B3262E] text-base font-black text-white shadow-sm">
                CP
              </div>
              <div>
                <p className="text-lg font-black text-[#22211f]">{SITE_NAME}</p>
                <p className="mt-1 font-semibold text-stone-500">{SITE_DESCRIPTOR}</p>
              </div>
            </div>
            <p className="mt-5 max-w-3xl leading-7">{FOOTER_TEXT}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            <nav aria-label="Navegacion secundaria">
              <p className="text-xs font-black uppercase tracking-wide text-[#B3262E]">
                Explorar
              </p>
              <div className="mt-3 grid gap-2">
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex min-h-9 items-center font-bold text-stone-700 underline-offset-4 hover:text-[#B3262E] hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#B3262E]">
                Contacto
              </p>
              <p className="mt-3 leading-6">
                Para actualizaciones, alianzas o correcciones de informacion,
                usa los canales oficiales de la iniciativa.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-y border-stone-200 py-6">
          <FoundersLogos compact />
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs leading-6 text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <p className="max-w-2xl">
            La informacion publicada pertenece a cada comercio aliado y puede
            cambiar sin previo aviso. Esta plataforma funciona como vitrina
            informativa, no como intermediario comercial.
          </p>
        </div>
      </div>
    </footer>
  );
}
