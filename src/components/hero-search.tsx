"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { STATUS_LABELS } from "@/lib/constants";
import type { BusinessStatus } from "@/types/business";

export function HeroSearch({ categories }: { categories: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<BusinessStatus | "all">("all");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    if (category !== "all") {
      params.set("categoria", category);
    }

    if (status !== "all") {
      params.set("estado", status);
    }

    const search = params.toString();
    router.push(search ? `/comercios?${search}` : "/comercios");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-lg bg-white p-3 shadow-xl ring-1 ring-black/10"
    >
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
        <label>
          <span className="text-xs font-black uppercase tracking-wide text-stone-500">
            Que buscas?
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre, categoria o descripcion"
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-4 text-base font-semibold text-[#22211f] outline-none focus:border-[#B3262E] focus:ring-2 focus:ring-[#B3262E]/20"
          />
        </label>
        <label>
          <span className="text-xs font-black uppercase tracking-wide text-stone-500">
            Categoria
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-4 text-base font-semibold text-[#22211f] outline-none focus:border-[#B3262E] focus:ring-2 focus:ring-[#B3262E]/20"
          >
            <option value="all">Todas</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="text-xs font-black uppercase tracking-wide text-stone-500">
            Estado
          </span>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as BusinessStatus | "all")
            }
            className="mt-2 min-h-12 w-full rounded-lg border border-stone-300 bg-[#fbfaf7] px-4 text-base font-semibold text-[#22211f] outline-none focus:border-[#B3262E] focus:ring-2 focus:ring-[#B3262E]/20"
          >
            <option value="all">Todos</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="min-h-12 rounded-lg bg-[#f5c84c] px-6 text-sm font-black text-[#22211f] transition hover:bg-[#e6b937] focus:outline-none focus:ring-2 focus:ring-[#B3262E] focus:ring-offset-2 lg:self-end"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}
