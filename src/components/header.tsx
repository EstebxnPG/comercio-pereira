"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_DESCRIPTOR, SITE_NAME } from "@/lib/constants";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/comercios", label: "Comercios" },
  { href: "/categorias", label: "Categorias" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/iniciativa", label: "Iniciativa" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--md-outline-variant)] bg-[var(--md-surface)]/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={closeMenu}>
          <span className="grid size-10 place-items-center rounded-xl bg-[#B3262E] text-lg font-black text-white shadow-sm">
            CP
          </span>
          <span className="leading-tight">
            <span className="block text-base font-black text-[#22211f]">
              {SITE_NAME}
            </span>
            <span className="hidden text-sm text-stone-600 sm:block">
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
              className="md-focus rounded-full px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-[var(--md-primary-container)] hover:text-[#7F1D1D]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/iniciativa#sumar-comercio"
            className="md-outlined-button hidden px-4 text-sm sm:inline-flex"
          >
            Sumar comercio
          </Link>
          <Link
            href="/comercios"
            className="md-filled-button px-4 text-sm"
          >
            Ver comercios
          </Link>
          <button
            type="button"
            className="md-outlined-button size-11 px-0 lg:hidden"
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
        className={`border-t border-[var(--md-outline-variant)] bg-[var(--md-surface)] px-4 py-3 shadow-sm sm:px-6 lg:hidden ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto grid max-w-6xl gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="md-focus flex min-h-12 items-center rounded-xl bg-[var(--md-surface-container)] px-4 text-sm font-bold text-stone-800 transition hover:text-[#B3262E]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/iniciativa#sumar-comercio"
            onClick={closeMenu}
            className="md-tonal-button px-4 text-sm sm:hidden"
          >
            Sumar comercio
          </Link>
        </div>
      </nav>
    </header>
  );
}
