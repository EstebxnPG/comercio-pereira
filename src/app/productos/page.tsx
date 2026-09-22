import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  getProductPriceDisplay,
  getPublishedProducts,
} from "@/lib/products";

type ProductsCatalogPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function ProductsCatalogPage(props: ProductsCatalogPageProps) {
  const searchParams = await props.searchParams;
  const query = getSingleParam(searchParams.q) ?? "";
  const products = await getPublishedProducts({ query });

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

        <section className="px-4 pb-10 sm:px-6 sm:pb-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {products.length === 0 ? (
              <div className="md-surface p-6 text-center">
                <h2 className="font-display text-lg font-bold sm:text-xl">
                  Sin productos publicados
                </h2>
                <p className="mt-2 text-sm font-semibold text-stone-600">
                  Cuando admin apruebe productos, apareceran en este catalogo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ProductCard({
  product,
}: {
  product: Awaited<ReturnType<typeof getPublishedProducts>>[number];
}) {
  const price = getProductPriceDisplay(product);

  return (
    <Link
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      href={`/productos/${product.slug}`}
    >
      <div className="relative grid aspect-[4/3] place-items-center bg-stone-100">
        {price.badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-black text-white shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
            {price.badge}
          </span>
        ) : null}
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-full w-full object-cover"
            src={product.primaryImageUrl}
          />
        ) : (
          <span className="text-xs font-black uppercase text-stone-500">
            Producto local
          </span>
        )}
      </div>
      <div className="grid gap-1 p-3 sm:gap-2 sm:p-4">
        <p className="truncate font-mono text-[10px] font-bold uppercase tracking-wide text-brand-deep sm:text-[11px]">
          {product.businessName}
        </p>
        <h2 className="font-display text-sm font-bold leading-tight group-hover:underline sm:text-xl">
          {product.name}
        </h2>
        <p className="line-clamp-2 hidden text-sm font-semibold leading-6 text-stone-600 sm:block">
          {product.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <p className="text-sm font-black text-ink">{price.current}</p>
          {price.original ? (
            <p className="text-xs font-bold text-stone-500 line-through">
              {price.original}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
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
