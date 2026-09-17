import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { formatProductPrice, getPublishedProducts } from "@/lib/products";

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
      <main className="bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8">
          <header className="grid gap-4 border-b border-stone-200 pb-6 md:grid-cols-[1fr_320px] md:items-end">
            <div>
              <p className="text-sm font-black uppercase text-[#B3262E]">
                Catalogo local
              </p>
              <h1 className="mt-2 text-4xl font-black">Productos en Pereira</h1>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-stone-600">
                Descubre productos publicados por comercios aliados y contacta
                directamente con cada negocio.
              </p>
            </div>
            <form className="flex gap-2">
              <input
                className="md-field"
                defaultValue={query}
                name="q"
                placeholder="Buscar producto"
              />
              <button className="md-filled-button px-5" type="submit">
                Buscar
              </button>
            </form>
          </header>

          {products.length === 0 ? (
            <section className="md-surface p-6">
              <h2 className="text-xl font-black">Sin productos publicados</h2>
              <p className="mt-2 text-sm font-semibold text-stone-600">
                Cuando admin apruebe productos, apareceran en este catalogo.
              </p>
            </section>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  href={`/productos/${product.slug}`}
                  key={product.id}
                >
                  <div className="grid aspect-[4/3] place-items-center bg-stone-100">
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
                  <div className="grid gap-2 p-4">
                    <p className="text-xs font-black uppercase text-[#B3262E]">
                      {product.businessName}
                    </p>
                    <h2 className="text-xl font-black group-hover:underline">
                      {product.name}
                    </h2>
                    <p className="line-clamp-2 text-sm font-semibold leading-6 text-stone-600">
                      {product.shortDescription}
                    </p>
                    <p className="text-sm font-black text-[#22211f]">
                      {formatProductPrice(product)}
                    </p>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
