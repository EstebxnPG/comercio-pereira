import Link from "next/link";
import Image from "next/image";
import { FoundersLogos } from "@/components/founders-logos";
import { FOOTER_TEXT, SITE_DESCRIPTOR, SITE_NAME } from "@/lib/constants";

const footerLinks = [
  { href: "/comercios", label: "Comercios" },
  { href: "/categorias", label: "Categorias" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/iniciativa", label: "Iniciativa" },
];

const socialLinks = [
  {
    href: "https://www.instagram.com/compraenpereira/",
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
        />
      </svg>
    ),
  },
  {
    href: "https://www.tiktok.com/@compraenpereiratk",
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16.2 2c.4 3.1 2.1 5 5.1 5.2v4.1a8.7 8.7 0 0 1-5-1.6v5.9c0 4.4-2.8 6.4-6.2 6.4-3.6 0-6.4-2.4-6.4-5.9 0-3.8 3.2-6.2 7.2-5.7v4.2c-1.8-.6-3.2.4-3.2 1.6 0 1 .9 1.8 2.2 1.8 1.4 0 2.3-.7 2.3-2.7V2h4Z"
        />
      </svg>
    ),
  },
  {
    href: "https://www.facebook.com/share/1EV56KEd5r/?mibextid=wwXIfr",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 8.5V7.1c0-.7.5-1.1 1.2-1.1h1.7V2.2A20.5 20.5 0 0 0 14 2c-3 0-5 1.8-5 5v1.5H5.7v4.1H9V22h4.2v-9.4h3.3l.6-4.1H14Z"
        />
      </svg>
    ),
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-[#fffdf8]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-stone-600 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div>
            <div className="flex items-start gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-[var(--md-outline-variant)]">
                <Image
                  src="/brand/compra-en-pereira-logo.png"
                  alt=""
                  width={1254}
                  height={1254}
                  className="h-10 w-10 object-contain"
                />
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

            <nav aria-label="Redes sociales de Compra en Pereira">
              <p className="text-xs font-black uppercase tracking-wide text-[#B3262E]">
                Redes sociales
              </p>
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    title={link.label}
                    className="md-focus grid size-11 place-items-center rounded-full border border-stone-200 bg-white text-[#B3262E] shadow-sm transition hover:border-[#B3262E]/45 hover:bg-[#ffdad8] hover:text-[#7F1D1D]"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </nav>
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
