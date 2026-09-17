import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  ProductViewTracker,
  TrackedProductLink,
} from "@/components/product-event-tracker";
import { SITE_NAME } from "@/lib/constants";
import {
  PRODUCT_AVAILABILITY_LABELS,
  formatProductPrice,
  getPublishedProductBySlug,
} from "@/lib/products";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/productos/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return {
    description: product.shortDescription,
    openGraph: {
      description: product.shortDescription,
      images: product.primaryImageUrl ? [product.primaryImageUrl] : undefined,
      title: `${product.name} | ${SITE_NAME}`,
      type: "article",
    },
    title: product.name,
  };
}

export default async function ProductDetailPage(
  props: PageProps<"/productos/[slug]">,
) {
  const { slug } = await props.params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const whatsappUrl = product.businessWhatsapp
    ? `https://wa.me/${product.businessWhatsapp}?text=${encodeURIComponent(
        `Hola, vi ${product.name} en COMPRAENPEREIRA.COM y quiero mas informacion.`,
      )}`
    : null;

  return (
    <>
      <Header />
      <ProductViewTracker businessId={product.businessId} productId={product.id} />
      <main className="bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
        <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            {product.primaryImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt=""
                className="aspect-[4/3] w-full object-cover"
                src={product.primaryImageUrl}
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-stone-100 text-sm font-black uppercase text-stone-500">
                Producto local
              </div>
            )}
          </div>
          <section className="grid content-start gap-5">
            <div>
              <Link
                className="text-sm font-black text-brand hover:underline"
                href={`/comercios/${product.businessSlug}`}
              >
                {product.businessName}
              </Link>
              <h1 className="mt-2 font-display text-4xl font-extrabold">
                {product.name}
              </h1>
              <p className="mt-3 text-lg font-black text-brand">
                {formatProductPrice(product)}
              </p>
            </div>
            <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-black uppercase text-brand-deep">
              {PRODUCT_AVAILABILITY_LABELS[product.availability]}
            </span>
            <p className="text-base font-semibold leading-7 text-stone-700">
              {product.description ?? product.shortDescription}
            </p>
            {whatsappUrl ? (
              <TrackedProductLink
                businessId={product.businessId}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25d366] px-5 text-sm font-black text-ink shadow-sm transition hover:bg-[#1fb457] hover:shadow-md"
                eventType="click_whatsapp"
                href={whatsappUrl}
                productId={product.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                Preguntar por WhatsApp
              </TrackedProductLink>
            ) : null}
            <Link className="md-outlined-button px-5" href="/productos">
              Volver al catalogo
            </Link>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
