"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { BusinessCard } from "@/components/business-card";
import { STATUS_LABELS } from "@/lib/constants";
import type { Business, BusinessStatus } from "@/types/business";

export function BusinessDirectory({
  businesses,
  categories,
  initialCategory = "all",
  initialQuery = "",
  initialStatus = "all",
}: {
  businesses: Business[];
  categories: string[];
  initialCategory?: string;
  initialQuery?: string;
  initialStatus?: BusinessStatus | "all";
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [status, setStatus] = useState<BusinessStatus | "all">(initialStatus);
  const deferredQuery = useDeferredValue(query);
  const deferredCategory = useDeferredValue(category);
  const deferredStatus = useDeferredValue(status);
  const isSearching =
    query !== deferredQuery ||
    category !== deferredCategory ||
    status !== deferredStatus;
  const searchableBusinesses = useMemo(
    () =>
      businesses.map((business) => ({
        business,
        searchText: getBusinessSearchText(business),
      })),
    [businesses],
  );

  const filteredBusinesses = useMemo(() => {
    const normalizedQuery = normalizeSearchText(deferredQuery.trim());

    return searchableBusinesses.filter(({ business, searchText }) => {
      const matchesQuery =
        normalizedQuery.length === 0 || searchText.includes(normalizedQuery);
      const matchesCategory =
        deferredCategory === "all" || business.category === deferredCategory;
      const matchesStatus =
        deferredStatus === "all" || business.status === deferredStatus;

      return matchesQuery && matchesCategory && matchesStatus;
    }).map(({ business }) => business);
  }, [deferredCategory, deferredQuery, deferredStatus, searchableBusinesses]);

  return (
    <section id="comercios" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
              Directorio
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#22211f]">
              Comercios aliados
            </h2>
          </div>
          <p
            aria-live="polite"
            className="inline-flex min-h-6 items-center gap-2 text-sm font-semibold text-stone-600"
          >
            {isSearching ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-[#B3262E]"
                />
                Buscando
              </>
            ) : (
              <>
                {filteredBusinesses.length} resultado
                {filteredBusinesses.length === 1 ? "" : "s"}
              </>
            )}
          </p>
        </div>

        <div className="md-surface-high mt-6 grid gap-3 p-3 sm:grid-cols-3">
          <label className="sm:col-span-1">
            <span className="text-sm font-bold text-stone-700">Buscar</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre, categoria o descripcion"
              className="md-field mt-2"
              aria-busy={isSearching}
            />
          </label>
          <label>
            <span className="text-sm font-bold text-stone-700">Categoria</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="md-field mt-2"
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
              className="md-field mt-2"
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
          <div className="md-surface mt-8 border-dashed p-8 text-center">
            <p className="text-lg font-black text-[#22211f]">
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

function getBusinessSearchText(business: Business) {
  return normalizeSearchText(
    [
      business.name,
      business.slug,
      business.category,
      business.shortDescription,
      business.fullDescription,
      business.status,
      STATUS_LABELS[business.status],
      business.phone,
      business.whatsapp,
      business.address,
      business.schedule,
      business.instagramUrl,
      business.facebookUrl,
      business.mapsUrl,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
