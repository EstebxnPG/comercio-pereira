"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { BrandBubble } from "@/components/brand-bubble";
import { BubbleSelect } from "@/components/bubble-select";
import { ProductCard } from "@/components/product-card";
import { getShortCategoryLabel } from "@/lib/category-labels";
import { STATUS_LABELS } from "@/lib/constants";
import { PRODUCT_AVAILABILITY_LABELS } from "@/lib/product-pricing";
import type {
  ProductAvailability,
  ProductSort,
  PublicProduct,
} from "@/lib/products";
import type { Business, BusinessStatus } from "@/types/business";

const PAGE_SIZE = 24;
const FEATURED_COUNT = 2;
const BRAND_CAROUSEL_LIMIT = 10;

const SORT_LABELS: Record<ProductSort, string> = {
  price_asc: "Precio: menor a mayor",
  price_desc: "Precio: mayor a menor",
  recent: "Mas recientes",
  relevance: "Relevancia",
};

export function ProductDirectory({
  brands,
  categories,
  initialAvailability = "all",
  initialCategory = "all",
  initialDiscountedOnly = false,
  initialLimit = PAGE_SIZE,
  initialQuery = "",
  initialSort = "relevance",
  initialStatus = "all",
  products,
  totalProducts,
}: {
  brands: Business[];
  categories: string[];
  initialAvailability?: ProductAvailability | "all";
  initialCategory?: string;
  initialDiscountedOnly?: boolean;
  initialLimit?: number;
  initialQuery?: string;
  initialSort?: ProductSort;
  initialStatus?: BusinessStatus | "all";
  products: PublicProduct[];
  totalProducts: number;
}) {
  const router = useRouter();
  const hasMore = products.length < totalProducts;
  const nextLimit = Math.min(initialLimit + PAGE_SIZE, totalProducts);
  const isFilteredByCategory = initialCategory !== "all";
  const featured = isFilteredByCategory ? products.slice(0, FEATURED_COUNT) : [];
  const brandCarouselItems = isFilteredByCategory
    ? brands.slice(0, BRAND_CAROUSEL_LIMIT)
    : [];
  const remaining = isFilteredByCategory ? products.slice(FEATURED_COUNT) : products;

  function goTo(overrides: Partial<DirectoryHrefParams>) {
    router.push(
      getDirectoryHref({
        availability: initialAvailability,
        category: initialCategory,
        discountedOnly: initialDiscountedOnly,
        limit: PAGE_SIZE,
        query: initialQuery,
        sort: initialSort,
        status: initialStatus,
        ...overrides,
      }),
    );
  }

  return (
    <section id="productos" className="bg-white py-8 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3">
          <BubbleSelect
            placeholder="Todas las categorias"
            value={initialCategory}
            options={[
              { value: "all", label: "Todas las categorias" },
              ...categories.map((category) => ({
                value: category,
                label: getShortCategoryLabel(category),
              })),
            ]}
            onChange={(category) => goTo({ category })}
          />
          <BubbleSelect
            placeholder="Todos"
            align="right"
            value={initialStatus}
            options={[
              { value: "all", label: "Todos" },
              ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
            ]}
            onChange={(status) => goTo({ status: status as BusinessStatus | "all" })}
          />
        </div>

        <div className="mt-3 flex gap-3">
          <BubbleSelect
            placeholder="Disponibilidad"
            value={initialAvailability}
            options={[
              { value: "all", label: "Disponibilidad" },
              ...Object.entries(PRODUCT_AVAILABILITY_LABELS).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
            onChange={(availability) =>
              goTo({ availability: availability as ProductAvailability | "all" })
            }
          />
          <BubbleSelect
            placeholder="Ordenar"
            align="right"
            value={initialSort}
            options={Object.entries(SORT_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(sort) => goTo({ sort: sort as ProductSort })}
          />
        </div>

        <button
          type="button"
          onClick={() => goTo({ discountedOnly: !initialDiscountedOnly })}
          className={`md-focus mt-3 flex min-h-11 w-fit items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
            initialDiscountedOnly
              ? "border-brand bg-brand text-white"
              : "border-[var(--md-outline-variant)] bg-white text-stone-600"
          }`}
        >
          Solo con descuento
        </button>

        {products.length > 0 ? (
          isFilteredByCategory ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {featured.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {brandCarouselItems.length > 0 ? (
                <div className="mt-8">
                  <AutoScrollCarousel className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]">
                    {brandCarouselItems.map((business) => (
                      <BrandBubble key={business.id} business={business} />
                    ))}
                    <a
                      href="#mas-productos"
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
                <div
                  id="mas-productos"
                  className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
                >
                  {remaining.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        ) : (
          <div className="md-surface mt-8 border-dashed p-8 text-center">
            <p className="font-display text-lg font-bold text-ink">
              No encontramos coincidencias.
            </p>
            <p className="mt-2 text-stone-600">
              Ajusta la busqueda o cambia los filtros para ver mas productos.
            </p>
          </div>
        )}

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <Link
              className="md-filled-button px-6"
              href={getDirectoryHref({
                availability: initialAvailability,
                category: initialCategory,
                discountedOnly: initialDiscountedOnly,
                limit: nextLimit,
                query: initialQuery,
                sort: initialSort,
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

type DirectoryHrefParams = {
  availability: ProductAvailability | "all";
  category: string;
  discountedOnly: boolean;
  limit: number;
  query: string;
  sort: ProductSort;
  status: BusinessStatus | "all";
};

function getDirectoryHref({
  availability,
  category,
  discountedOnly,
  limit,
  query,
  sort,
  status,
}: DirectoryHrefParams) {
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

  if (availability !== "all") {
    params.set("disponibilidad", availability);
  }

  if (discountedOnly) {
    params.set("descuento", "1");
  }

  if (sort !== "relevance") {
    params.set("orden", sort);
  }

  params.set("limite", String(limit));

  return `/productos?${params.toString()}`;
}
