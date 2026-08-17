import Link from "next/link";
import { FOOTER_TEXT, SITE_NAME } from "@/lib/constants";

const footerLinks = [
  { href: "/comercios", label: "Comercios" },
  { href: "/categorias", label: "Categorias" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/iniciativa", label: "Iniciativa" },
];

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 text-sm text-stone-600 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-bold text-[#22211f]">{SITE_NAME}</p>
          <p className="mt-3 max-w-3xl leading-6">{FOOTER_TEXT}</p>
        </div>
        <nav aria-label="Navegacion secundaria" className="flex flex-wrap gap-3 lg:max-w-56">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-bold text-stone-700 underline-offset-4 hover:text-[#B3262E] hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
