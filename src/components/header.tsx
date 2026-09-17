"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  SITE_DESCRIPTOR,
  SITE_NAME,
} from "@/lib/constants";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/comercios", label: "Comercios" },
  { href: "/categorias", label: "Categorias" },
  { href: "/iniciativa", label: "Iniciativa" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const inclusionHref = "/registrar-comercio";

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--md-outline-variant)]/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5" onClick={closeMenu}>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-[var(--md-outline-variant)]">
            <Image
              src="/brand/compra-en-pereira-logo.png"
              alt=""
              width={1254}
              height={1254}
              className="h-8 w-8 object-contain"
            />
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-display text-base font-extrabold leading-5 text-ink">
              {SITE_NAME}
            </span>
            <span className="hidden text-xs font-semibold text-stone-500 sm:block">
              {SITE_DESCRIPTOR}
            </span>
          </span>
        </Link>
        <nav
          aria-label="Navegacion principal"
          className="hidden items-center gap-1 lg:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="md-focus rounded-full px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-gold-soft hover:text-brand-deep"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href={inclusionHref}
            className="md-focus hidden min-h-11 items-center justify-center rounded-full border border-stone-300 px-4 text-sm font-black text-brand-deep transition hover:border-brand hover:bg-gold-soft sm:inline-flex"
          >
            Sumar mi comercio
          </Link>
          <Link
            href="/comercios"
            className="md-focus hidden min-h-11 items-center justify-center rounded-full bg-brand px-5 text-sm font-black text-white shadow-sm transition hover:bg-brand-hover hover:shadow-md min-[420px]:inline-flex"
          >
            Ver comercios
          </Link>
          <button
            type="button"
            className="md-outlined-button size-11 shrink-0 px-0 lg:hidden"
            aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            <span className="sr-only">
              {isMenuOpen ? "Cerrar menu" : "Abrir menu"}
            </span>
            <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
              <span
                className={`h-0.5 rounded-full bg-current transition ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 rounded-full bg-current transition ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 rounded-full bg-current transition ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>
      <nav
        id="mobile-navigation"
        aria-label="Navegacion movil"
        className={`border-t border-[var(--md-outline-variant)] bg-white px-4 py-3 shadow-sm sm:px-6 lg:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto grid max-w-7xl gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="md-focus flex min-h-12 items-center rounded-xl bg-[var(--md-surface-container)] px-4 text-sm font-bold text-stone-800 transition hover:text-brand-deep"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={inclusionHref}
            onClick={closeMenu}
            className="md-focus inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-soft px-4 text-sm font-black text-brand-deep transition hover:bg-brand-soft-hover sm:hidden"
          >
            Sumar mi comercio
          </Link>
        </div>
      </nav>
    </header>
  );
}
