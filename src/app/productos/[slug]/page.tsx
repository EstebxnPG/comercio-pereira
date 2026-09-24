import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import {
  ProductViewTracker,
  TrackedProductLink,
} from "@/components/product-event-tracker";
import { ProductCard } from "@/components/product-card";
import { SITE_NAME } from "@/lib/constants";
import {
  PRODUCT_AVAILABILITY_LABELS,
  getProductPriceDisplay,
  getPublishedProductBySlug,
  getPublishedProductsForBusiness,
} from "@/lib/products";

const RELATED_PRODUCTS_LIMIT = 4;

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  props: ProductDetailPageProps,
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

export default async function ProductDetailPage(props: ProductDetailPageProps) {
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
  const price = getProductPriceDisplay(product);
  const relatedProducts = (
    await getPublishedProductsForBusiness(product.businessId, RELATED_PRODUCTS_LIMIT + 1)
  )
    .filter((candidate) => candidate.id !== product.id)
    .slice(0, RELATED_PRODUCTS_LIMIT);
  const galleryImages =
    product.images.length > 0
      ? product.images
      : product.primaryImageUrl
        ? [
            {
              altText: product.name,
              id: "primary-image",
              isPrimary: true,
              publicUrl: product.primaryImageUrl,
              sortOrder: 0,
            },
          ]
        : [];

  return (
    <>
      <Header />
      <ProductViewTracker
        businessId={product.businessId}
        isDiscounted={price.hasDiscount}
        productId={product.id}
      />
      <main className="bg-paper px-4 py-6 text-ink sm:px-6 sm:py-10 lg:px-8">
        <article className="mx-auto grid max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-2.5 sm:gap-3">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              {galleryImages[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={galleryImages[0].altText ?? product.name}
                  className="aspect-[4/3] w-full object-cover"
                  src={galleryImages[0].publicUrl}
                />
              ) : (
                <div className="grid aspect-[4/3] place-items-center bg-stone-100 text-sm font-black uppercase text-stone-500">
                  Producto local
                </div>
              )}
            </div>
            {galleryImages.length > 1 ? (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {galleryImages.slice(1, 5).map((image) => (
                  <div
                    className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
                    key={image.id}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={image.altText ?? product.name}
                      className="aspect-square w-full object-cover"
                      src={image.publicUrl}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <section className="grid content-start gap-4 sm:gap-5">
            <div>
              <Link
                className="text-sm font-black text-brand hover:underline"
                href={`/comercios/${product.businessSlug}`}
              >
                {product.businessName}
              </Link>
              <h1 className="mt-1.5 font-display text-2xl font-extrabold leading-tight sm:mt-2 sm:text-4xl">
                {product.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2.5 sm:mt-3 sm:gap-3">
                <p className="text-lg font-black text-brand">{price.current}</p>
                {price.original ? (
                  <p className="text-sm font-bold text-stone-500 line-through">
                    {price.original}
                  </p>
                ) : null}
                {price.badge ? (
                  <span className="rounded-full bg-brand px-3 py-1 text-xs font-black uppercase text-white">
                    {price.badge}
                  </span>
                ) : null}
              </div>
            </div>
            <span className="w-fit rounded-full bg-brand-soft px-3 py-1 text-xs font-black uppercase text-brand-deep">
              {PRODUCT_AVAILABILITY_LABELS[product.availability]}
            </span>
            <p className="text-sm font-semibold leading-6 text-stone-700 sm:text-base sm:leading-7">
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

        {relatedProducts.length > 0 ? (
          <div className="mx-auto mt-10 max-w-6xl sm:mt-14">
            <p className="text-xs font-black uppercase tracking-wide text-brand sm:text-sm">
              Mismo comercio
            </p>
            <h2 className="mt-1.5 font-display text-xl font-extrabold text-ink sm:mt-2 sm:text-2xl">
              Mas de {product.businessName}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
