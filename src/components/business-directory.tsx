"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { BrandBubble } from "@/components/brand-bubble";
import { BusinessCard } from "@/components/business-card";
import { HomeBusinessCard } from "@/components/home-business-card";
import { STATUS_LABELS } from "@/lib/constants";
import type { Business, BusinessStatus } from "@/types/business";

const PAGE_SIZE = 24;
const FEATURED_COUNT = 2;
const BRAND_CAROUSEL_LIMIT = 10;

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
  const router = useRouter();
  const hasMore = businesses.length < totalBusinesses;
  const nextLimit = Math.min(initialLimit + PAGE_SIZE, totalBusinesses);
  const isFilteredByCategory = initialCategory !== "all";
  const featured = isFilteredByCategory ? businesses.slice(0, FEATURED_COUNT) : [];
  const brandCarouselItems = isFilteredByCategory
    ? businesses.slice(0, BRAND_CAROUSEL_LIMIT)
    : [];
  const remaining = isFilteredByCategory ? businesses.slice(FEATURED_COUNT) : businesses;

  return (
    <section id="comercios" className="bg-white py-8 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <select
            value={initialCategory}
            onChange={(event) => {
              router.push(
                getDirectoryHref({
                  category: event.target.value,
                  limit: PAGE_SIZE,
                  query: initialQuery,
                  status: initialStatus,
                }),
              );
            }}
            aria-label="Filtrar por tipo de comercio"
            className="md-field w-full sm:w-auto"
          >
            <option value="all">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            <StatusPill
              label="Todos"
              active={initialStatus === "all"}
              href={getDirectoryHref({
                category: initialCategory,
                limit: PAGE_SIZE,
                query: initialQuery,
                status: "all",
              })}
            />
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <StatusPill
                key={value}
                label={label}
                active={initialStatus === value}
                href={getDirectoryHref({
                  category: initialCategory,
                  limit: PAGE_SIZE,
                  query: initialQuery,
                  status: value as BusinessStatus,
                })}
              />
            ))}
          </div>
        </div>

        {businesses.length > 0 ? (
          isFilteredByCategory ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {featured.map((business) => (
                  <HomeBusinessCard key={business.id} business={business} />
                ))}
              </div>

              {brandCarouselItems.length > 0 ? (
                <div className="mt-8">
                  <AutoScrollCarousel className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]">
                    {brandCarouselItems.map((business) => (
                      <BrandBubble key={business.id} business={business} />
                    ))}
                    <a
                      href="#mas-comercios"
                      className="md-focus flex min-w-[84px] shrink-0 snap-start flex-col items-center gap-1.5 sm:min-w-[100px]"
                    >
                      <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-deep shadow-[0_4px_14px_rgb(36_21_18/0.14)] sm:size-20">
                        <MoreIcon className="size-6" />
                      </span>
                      <span className="text-center text-xs font-bold text-brand-deep">
                        Ver mas
                      </span>
                    </a>
                  </AutoScrollCarousel>
                </div>
              ) : null}

              {remaining.length > 0 ? (
                <div id="mas-comercios" className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {remaining.map((business) => (
                    <BusinessCard key={business.id} business={business} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )
        ) : (
          <div className="md-surface mt-8 border-dashed p-8 text-center">
            <p className="font-display text-lg font-bold text-ink">
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

function StatusPill({
  label,
  active,
  href,
}: {
  label: string;
  active: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold transition ${
        active
          ? "bg-brand text-white"
          : "bg-[var(--md-surface-container)] text-stone-600 hover:bg-brand-soft hover:text-brand-deep"
      }`}
    >
      {label}
    </Link>
  );
}

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
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
