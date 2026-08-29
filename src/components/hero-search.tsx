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
      <div className="mb-2 flex flex-wrap items-center gap-2 sm:mb-3">
        <p className="text-sm font-black text-white drop-shadow-sm sm:text-base">
          Busca por negocio, categoria o servicio
        </p>
        <span className="hidden h-1 w-1 rounded-full bg-[#f5c84c] sm:block" />
        <p className="hidden text-sm font-semibold text-white/80 sm:block">
          Explora comercios reales de Pereira
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[1.35rem] border border-[#f5c84c]/80 bg-white shadow-[0_28px_80px_rgb(34_21_20/0.42)] ring-4 ring-white/18"
      >
        <div className="grid lg:grid-cols-[minmax(340px,1fr)_minmax(240px,320px)_154px]">
          <label className="group flex min-h-[58px] items-center gap-3 border-b border-stone-200 px-4 transition focus-within:bg-[#fbfaf7] sm:min-h-[76px] sm:px-5 lg:border-b-0 lg:border-r">
            <SearchIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black uppercase text-[#B3262E]">
                Buscar comercio
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Restaurantes, ropa, ferreterias, belleza..."
                className="mt-1 min-h-7 w-full bg-transparent text-[15px] font-bold text-[#22211f] outline-none placeholder:text-stone-500 sm:min-h-8 sm:text-lg"
              />
            </span>
          </label>

          <label className="relative flex min-h-[58px] items-center gap-3 border-b border-stone-200 px-4 transition focus-within:bg-[#fbfaf7] sm:min-h-[76px] sm:px-5 lg:border-b-0 lg:border-r">
            <CategoryIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black uppercase text-[#B3262E]">
                Categoria
              </span>
              <span className="sr-only">Categoria</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 min-h-7 w-full appearance-none bg-transparent pr-7 text-sm font-bold text-[#22211f] outline-none sm:min-h-8 sm:text-base"
              >
                <option value="all">Todas las categorias</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </span>
            <span
              className="pointer-events-none absolute right-4 text-xs text-stone-400"
              aria-hidden="true"
            >
            ▼
            </span>
          </label>

          <button
            type="submit"
            className="m-2 min-h-12 rounded-xl bg-[#B3262E] px-7 text-base font-black text-white shadow-md transition hover:bg-[#8F2026] hover:shadow-lg active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[#f5c84c] focus:ring-offset-2 sm:m-3 sm:min-h-13 lg:m-2"
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
            className="md-focus shrink-0 rounded-full border border-white/18 bg-white/12 px-3 py-2 text-xs font-black text-white backdrop-blur transition hover:border-[#f5c84c]/70 hover:bg-[#f5c84c] hover:text-[#22211f] active:translate-y-px"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-stone-400"
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

function CategoryIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0 text-stone-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
    </svg>
  );
}
