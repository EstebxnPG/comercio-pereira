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
  getProductPriceDisplay,
  getPublishedProductBySlug,
} from "@/lib/products";

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
      <main className="bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
        <article className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-3">
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
              <div className="grid grid-cols-4 gap-3">
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
          <section className="grid content-start gap-5">
            <div>
              <Link
                className="text-sm font-black text-[#B3262E] hover:underline"
                href={`/comercios/${product.businessSlug}`}
              >
                {product.businessName}
              </Link>
              <h1 className="mt-2 text-4xl font-black">{product.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="text-lg font-black text-[#B3262E]">
                  {price.current}
                </p>
                {price.original ? (
                  <p className="text-sm font-bold text-stone-500 line-through">
                    {price.original}
                  </p>
                ) : null}
                {price.badge ? (
                  <span className="rounded-full bg-[#B3262E] px-3 py-1 text-xs font-black uppercase text-white">
                    {price.badge}
                  </span>
                ) : null}
              </div>
            </div>
            <span className="w-fit rounded-full bg-[#ffdad8] px-3 py-1 text-xs font-black uppercase text-[#410006]">
              {PRODUCT_AVAILABILITY_LABELS[product.availability]}
            </span>
            <p className="text-base font-semibold leading-7 text-stone-700">
              {product.description ?? product.shortDescription}
            </p>
            {whatsappUrl ? (
              <TrackedProductLink
                businessId={product.businessId}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25d366] px-5 text-sm font-black text-[#22211f] shadow-sm transition hover:bg-[#1fb457] hover:shadow-md"
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
