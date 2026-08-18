"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    <div className="mt-8 max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10"
      >
        <div className="grid lg:grid-cols-[minmax(280px,1fr)_minmax(260px,340px)_140px]">
          <label className="group flex min-h-20 items-center gap-3 border-b border-stone-200 px-4 transition focus-within:bg-[#fbfaf7] lg:border-b-0 lg:border-r">
            <SearchIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-[#22211f]">
                Que buscas?
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nombre, categoria o descripcion"
                className="mt-1 min-h-7 w-full bg-transparent text-sm font-semibold text-stone-600 outline-none placeholder:text-stone-400"
              />
            </span>
          </label>

          <label className="relative flex min-h-20 items-center gap-3 border-b border-stone-200 px-4 transition focus-within:bg-[#fbfaf7] lg:border-b-0 lg:border-r">
            <CategoryIcon />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-[#22211f]">
                Categoria
              </span>
              <span className="sr-only">Categoria</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-1 min-h-7 w-full appearance-none bg-transparent pr-7 text-sm font-semibold text-stone-600 outline-none"
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
            className="m-3 min-h-14 rounded-xl bg-[#f5c84c] px-7 text-sm font-black text-[#22211f] shadow-md transition hover:bg-[#e6b937] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#B3262E] focus:ring-offset-2 lg:m-2"
          >
            Buscar
          </button>
        </div>
      </form>
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
