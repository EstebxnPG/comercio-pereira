"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const suggestedSearches = ["Restaurantes", "Ropa", "Ferreterias", "Belleza"];

export function HeroSearch({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (category !== "all") {
      params.set("categoria", category);
    }

    const search = params.toString();
    router.push(search ? `/comercios?${search}` : "/comercios");
  }

  return (
    <div className="mt-5 max-w-5xl sm:mt-7">
      <div className="mb-2 hidden flex-wrap items-center gap-2 sm:mb-3 sm:flex">
        <p className="text-sm font-black text-white drop-shadow-sm sm:text-base">
          Busca por negocio, categoria o servicio
        </p>
        <span className="hidden h-1 w-1 rounded-full bg-gold sm:block" />
        <p className="hidden text-sm font-semibold text-white/80 sm:block">
          Explora comercios reales de Pereira
        </p>
      </div>
      <form onSubmit={handleSubmit} className="sm:hidden">
        <div className="flex items-center gap-2.5 rounded-full border border-[var(--md-outline-variant)] bg-white py-[.3rem] pl-[1.05rem] pr-[.3rem] shadow-[0_24px_48px_-18px_rgba(36,26,22,0.38)]">
          <SearchIcon className="size-[1.1rem] shrink-0 text-[var(--md-outline)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Que buscas hoy?"
            className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-stone-500"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="grid size-[2.6rem] shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-hover active:translate-y-px focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
          >
            <ArrowRightIcon className="size-[1.1rem]" />
          </button>
        </div>
      </form>

      <form
        onSubmit={handleSubmit}
        className="hidden overflow-hidden rounded-[1.35rem] border border-gold/80 bg-white shadow-[0_28px_80px_rgb(20_12_10/0.45)] ring-4 ring-white/18 sm:block"
      >
        <div className="grid lg:grid-cols-[minmax(340px,1fr)_minmax(240px,320px)_154px]">
          <label className="group flex min-h-[58px] items-center gap-3 border-b border-[var(--md-outline-variant)] px-4 transition focus-within:bg-paper sm:min-h-[76px] sm:px-5 lg:border-b-0 lg:border-r">
            <SearchIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black uppercase tracking-wide text-brand">
                Buscar comercio
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Restaurantes, ropa, ferreterias, belleza..."
                className="mt-1 min-h-7 w-full bg-transparent text-[15px] font-bold text-ink outline-none placeholder:text-stone-500 sm:min-h-8 sm:text-lg"
              />
            </span>
          </label>

          <label className="relative flex min-h-[58px] items-center gap-3 border-b border-[var(--md-outline-variant)] px-4 transition focus-within:bg-paper sm:min-h-[76px] sm:px-5 lg:border-b-0 lg:border-r">
            <CategoryIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black uppercase tracking-wide text-brand">
                Categoria
              </span>
              <span className="sr-only">Categoria</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 min-h-7 w-full appearance-none bg-transparent pr-7 text-sm font-bold text-ink outline-none sm:min-h-8 sm:text-base"
              >
                <option value="all">Todas las categorias</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </span>
            <ChevronDownIcon className="pointer-events-none absolute right-4 size-3.5 text-stone-400" />
          </label>

          <button
            type="submit"
            className="m-2 min-h-12 rounded-xl bg-brand px-7 text-base font-black text-white shadow-md transition hover:bg-brand-hover hover:shadow-lg active:translate-y-px focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 sm:m-3 sm:min-h-13 lg:m-2"
          >
            Buscar
          </button>
        </div>
      </form>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" aria-label="Busquedas sugeridas">
        {suggestedSearches.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setQuery(suggestion)}
            className="md-focus shrink-0 rounded-full border border-white/18 bg-white/12 px-3 py-2 text-xs font-black text-white backdrop-blur transition hover:border-gold/70 hover:bg-gold hover:text-ink active:translate-y-px"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchIcon({ className = "size-5 shrink-0 text-stone-400" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.3-4.3" />
      <circle cx="11" cy="11" r="7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-stone-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.5 3.5 20 12l-8 8-8.5-8.5V3.5Z" />
      <path d="M3.5 3.5h8" />
      <circle cx="7.2" cy="7.2" r="1.3" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
