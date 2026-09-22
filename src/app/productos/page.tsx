import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductDirectory } from "@/components/product-directory";
import { getCategories, getPublishedBusinessesPage } from "@/lib/businesses";
import { BUSINESS_STATUSES, type BusinessStatus } from "@/types/business";
import { getPublishedProductsPage } from "@/lib/products";

const BRAND_LIMIT = 10;

type ProductsCatalogPageProps = {
  searchParams: Promise<{
    categoria?: string | string[];
    estado?: string | string[];
    limite?: string | string[];
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
  const query = parseSearch(getSingleParam(searchParams.q));
  const limit = parseLimit(getSingleParam(searchParams.limite));

  const [productsPage, brandsPage] = await Promise.all([
    getPublishedProductsPage({
      category: selectedCategory,
      limit,
      query,
      status: selectedStatus,
    }),
    selectedCategory !== "all"
      ? getPublishedBusinessesPage({ category: selectedCategory, limit: BRAND_LIMIT })
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
          initialCategory={selectedCategory}
          initialLimit={limit}
          initialQuery={query}
          initialStatus={selectedStatus}
          products={productsPage.products}
          totalProducts={productsPage.total}
        />
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
