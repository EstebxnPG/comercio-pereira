import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getBusinessBySlug } from "@/lib/businesses";
import { formatProductPrice, getPublishedProductsForBusiness } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/comercios/[slug]/productos">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  return {
    title: `Productos de ${business.name}`,
  };
}

export default async function BusinessProductsPage(
  props: PageProps<"/comercios/[slug]/productos">,
) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  const products = await getPublishedProductsForBusiness(business.id, 36);

  return (
    <>
      <Header />
      <main className="bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <div>
            <Link
              href={`/comercios/${business.slug}`}
              className="text-sm font-black text-brand hover:underline"
            >
              Volver a {business.name}
            </Link>
            <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
              Catalogo
            </p>
            <h1 className="mt-1 font-display text-3xl font-extrabold">
              Productos de {business.name}
            </h1>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
                  <div className="grid gap-1 p-3 sm:gap-2 sm:p-4">
                    <h2 className="text-sm font-black leading-tight group-hover:underline sm:text-lg">
                      {product.name}
                    </h2>
                    <p className="line-clamp-2 hidden text-sm font-semibold leading-6 text-stone-600 sm:block">
                      {product.shortDescription}
                    </p>
                    <p className="text-sm font-black text-brand">
                      {formatProductPrice(product)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-stone-600">
              Este comercio aun no tiene productos publicados.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
