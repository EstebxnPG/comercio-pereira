"use client";

import Link from "next/link";
import { BusinessCard } from "@/components/business-card";
import { STATUS_LABELS } from "@/lib/constants";
import type { Business, BusinessStatus } from "@/types/business";

const PAGE_SIZE = 24;

export function BusinessDirectory({
  businesses,
  categories,
  initialCategory = "all",
  initialLimit = PAGE_SIZE,
  initialQuery = "",
  initialStatus = "all",
  totalBusinesses,
}: {
  businesses: Business[];
  categories: string[];
  initialCategory?: string;
  initialLimit?: number;
  initialQuery?: string;
  initialStatus?: BusinessStatus | "all";
  totalBusinesses: number;
}) {
  const hasMore = businesses.length < totalBusinesses;
  const nextLimit = Math.min(initialLimit + PAGE_SIZE, totalBusinesses);

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
            Mostrando {businesses.length} de {totalBusinesses} resultado
            {totalBusinesses === 1 ? "" : "s"}
          </p>
        </div>

        <form
          action="/comercios"
          className="md-surface-high mt-6 grid gap-3 p-3 sm:grid-cols-3"
        >
          <input name="limite" type="hidden" value={PAGE_SIZE} />
          <label className="sm:col-span-1">
            <span className="text-sm font-bold text-stone-700">Buscar</span>
            <input
              defaultValue={initialQuery}
              placeholder="Nombre, descripcion, telefono o direccion"
              className="md-field mt-2"
              name="q"
              type="search"
            />
          </label>
          <label>
            <span className="text-sm font-bold text-stone-700">Categoria</span>
            <select
              defaultValue={initialCategory}
              className="md-field mt-2"
              name="categoria"
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
              defaultValue={initialStatus}
              className="md-field mt-2"
              name="estado"
            >
              <option value="all">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-2 sm:col-span-3 sm:flex-row sm:justify-end">
            <Link className="md-outlined-button px-4 text-center" href="/comercios">
              Limpiar
            </Link>
            <button className="md-filled-button px-5" type="submit">
              Aplicar filtros
            </button>
          </div>
        </form>

        {businesses.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
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

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <Link
              className="md-filled-button px-6"
              href={getDirectoryHref({
                category: initialCategory,
                limit: nextLimit,
                query: initialQuery,
                status: initialStatus,
              })}
              scroll={false}
            >
              Mostrar mas
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getDirectoryHref({
  category,
  limit,
  query,
  status,
}: {
  category: string;
  limit: number;
  query: string;
  status: BusinessStatus | "all";
}) {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  if (category !== "all") {
    params.set("categoria", category);
  }

  if (status !== "all") {
    params.set("estado", status);
  }

  params.set("limite", String(limit));

  return `/comercios?${params.toString()}`;
}
