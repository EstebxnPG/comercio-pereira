"use client";

import { useMemo, useState } from "react";
import { BusinessCard } from "@/components/business-card";
import { STATUS_LABELS } from "@/lib/constants";
import type { Business, BusinessStatus } from "@/types/business";

export function BusinessDirectory({
  businesses,
  categories,
}: {
  businesses: Business[];
  categories: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<BusinessStatus | "all">("all");

  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return businesses.filter((business) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [business.name, business.category, business.shortDescription]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        category === "all" || business.category === category;
      const matchesStatus = status === "all" || business.status === status;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [businesses, category, query, status]);

  return (
    <section id="comercios" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#176b5b]">
              Directorio
            </p>
            <h2 className="mt-2 text-3xl font-black text-stone-950">
              Comercios aliados
            </h2>
          </div>
          <p className="text-sm font-semibold text-stone-600">
            {filteredBusinesses.length} resultado
            {filteredBusinesses.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-6 grid gap-3 rounded-lg border border-stone-200 bg-[#fbfaf7] p-3 sm:grid-cols-3">
          <label className="sm:col-span-1">
            <span className="text-sm font-bold text-stone-700">Buscar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, categoria o descripcion"
              className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-950 outline-none focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/20"
            />
          </label>
          <label>
            <span className="text-sm font-bold text-stone-700">Categoria</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-950 outline-none focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/20"
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
            <span className="text-sm font-bold text-stone-700">Estado</span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as BusinessStatus | "all")
              }
              className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-base text-stone-950 outline-none focus:border-[#176b5b] focus:ring-2 focus:ring-[#176b5b]/20"
            >
              <option value="all">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredBusinesses.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-stone-300 bg-[#fbfaf7] p-8 text-center">
            <p className="text-lg font-black text-stone-950">
              No encontramos coincidencias.
            </p>
            <p className="mt-2 text-stone-600">
              Ajusta la busqueda o cambia los filtros para ver mas comercios.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
