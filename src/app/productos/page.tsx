import { BusinessCard } from "@/components/business-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductDirectory } from "@/components/product-directory";
import { getCategories, getPublishedBusinessesPage } from "@/lib/businesses";
import { BUSINESS_STATUSES, type BusinessStatus } from "@/types/business";
import {
  PRODUCT_AVAILABILITY_LABELS,
  getPublishedProductsPage,
  type ProductAvailability,
  type ProductSort,
} from "@/lib/products";

const BRAND_LIMIT = 10;
const RELATED_BUSINESSES_LIMIT = 6;
const PRODUCT_SORTS: ProductSort[] = ["relevance", "recent", "price_asc", "price_desc"];

type ProductsCatalogPageProps = {
  searchParams: Promise<{
    categoria?: string | string[];
    descuento?: string | string[];
    disponibilidad?: string | string[];
    estado?: string | string[];
    limite?: string | string[];
    orden?: string | string[];
    q?: string | string[];
  }>;
};

export default async function ProductsCatalogPage(props: ProductsCatalogPageProps) {
  const categories = getCategories();
  const searchParams = await props.searchParams;
  const selectedCategory = categories.includes(
    getSingleParam(searchParams.categoria) ?? "",
  )
    ? getSingleParam(searchParams.categoria) ?? "all"
    : "all";
  const rawStatus = getSingleParam(searchParams.estado);
  const selectedStatus =
    rawStatus && BUSINESS_STATUSES.includes(rawStatus as BusinessStatus)
      ? (rawStatus as BusinessStatus)
      : "all";
  const rawAvailability = getSingleParam(searchParams.disponibilidad);
  const selectedAvailability =
    rawAvailability && rawAvailability in PRODUCT_AVAILABILITY_LABELS
      ? (rawAvailability as ProductAvailability)
      : "all";
  const rawSort = getSingleParam(searchParams.orden);
  const selectedSort = PRODUCT_SORTS.includes(rawSort as ProductSort)
    ? (rawSort as ProductSort)
    : "relevance";
  const discountedOnly = getSingleParam(searchParams.descuento) === "1";
  const query = parseSearch(getSingleParam(searchParams.q));
  const limit = parseLimit(getSingleParam(searchParams.limite));

  const [productsPage, brandsPage, relatedBusinesses] = await Promise.all([
    getPublishedProductsPage({
      availability: selectedAvailability,
      category: selectedCategory,
      discountedOnly,
      limit,
      query,
      sort: selectedSort,
      status: selectedStatus,
    }),
    selectedCategory !== "all"
      ? getPublishedBusinessesPage({ category: selectedCategory, limit: BRAND_LIMIT })
      : Promise.resolve({ businesses: [], total: 0 }),
    query
      ? getPublishedBusinessesPage({ query, limit: RELATED_BUSINESSES_LIMIT })
      : Promise.resolve({ businesses: [], total: 0 }),
  ]);

  return (
    <>
      <Header />
      <main className="bg-paper">
        <section className="px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-black uppercase tracking-wide text-brand sm:text-sm">
              Catalogo local
            </p>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold text-ink sm:mt-2 sm:text-4xl">
              Productos en Pereira
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600 sm:mt-3 sm:text-base sm:leading-7">
              Descubre productos publicados por comercios aliados y contacta
              directamente con cada negocio.
            </p>

            <form className="mt-5 sm:mt-6" action="/productos">
              <div className="flex items-center gap-2.5 rounded-full border border-[var(--md-outline-variant)] bg-white py-[.3rem] pl-[1.05rem] pr-[.3rem] shadow-sm">
                <SearchIcon className="size-[1.1rem] shrink-0 text-stone-400" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:text-stone-500"
                  defaultValue={query}
                  name="q"
                  placeholder="Que producto buscas?"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="grid size-[2.6rem] shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-hover active:translate-y-px"
                >
                  <ArrowRightIcon className="size-[1.1rem]" />
                </button>
              </div>
            </form>
          </div>
        </section>

        <ProductDirectory
          brands={brandsPage.businesses}
          categories={categories}
          initialAvailability={selectedAvailability}
          initialCategory={selectedCategory}
          initialDiscountedOnly={discountedOnly}
          initialLimit={limit}
          initialQuery={query}
          initialSort={selectedSort}
          initialStatus={selectedStatus}
          products={productsPage.products}
          totalProducts={productsPage.total}
        />

        {query && relatedBusinesses.businesses.length > 0 ? (
          <section className="border-t border-[var(--md-outline-variant)] bg-paper py-8 sm:py-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
              <p className="text-xs font-black uppercase tracking-wide text-brand sm:text-sm">
                Tambien te puede interesar
              </p>
              <h2 className="mt-1.5 font-display text-xl font-extrabold text-ink sm:mt-2 sm:text-2xl">
                Comercios relacionados
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {relatedBusinesses.businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

function SearchIcon({ className }: { className?: string }) {
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

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSearch(value: string | undefined) {
  return value?.trim().replace(/\s+/g, " ").slice(0, 80) ?? "";
}

function parseLimit(value: string | undefined) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 24) {
    return 24;
  }

  return Math.min(parsed, 96);
}
