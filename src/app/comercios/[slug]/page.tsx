import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BusinessProfileViewTracker,
  TrackedBusinessLink,
} from "@/components/business-event-tracker";
import { BusinessCover } from "@/components/business-cover";
import { BusinessLogo } from "@/components/business-logo";
import { BusinessStatusBadge } from "@/components/business-status";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ShareButtons } from "@/components/share-buttons";
import { SocialLinks } from "@/components/social-links";
import { getBusinessBySlug } from "@/lib/businesses";
import { DEFAULT_BUSINESS_COVER_IMAGE, SITE_NAME, STATUS_LABELS } from "@/lib/constants";
import {
  formatProductPrice,
  getPublishedProductsForBusiness,
} from "@/lib/products";
import { absoluteUrl, formatDate, isSafeExternalUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PRODUCT_CAROUSEL_LIMIT = 10;

export async function generateMetadata(
  props: PageProps<"/comercios/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  const url = `/comercios/${business.slug}`;
  const description = `${business.shortDescription} Estado: ${
    STATUS_LABELS[business.status]
  }.`;

  return {
    title: business.name,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${business.name} | ${SITE_NAME}`,
      description,
      url,
      images: [business.coverImage],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${business.name} | ${SITE_NAME}`,
      description,
      images: [business.coverImage],
    },
  };
}

export default async function BusinessPage(
  props: PageProps<"/comercios/[slug]">,
) {
  const { slug } = await props.params;
  const business = await getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  const products = await getPublishedProductsForBusiness(business.id);
  const hasCoverImage = business.coverImage !== DEFAULT_BUSINESS_COVER_IMAGE;
  const profileUrl = absoluteUrl(`/comercios/${business.slug}`);
  const shareText = `El centro sigue latiendo\n\nConoce a ${business.name}, comercio aliado de ${SITE_NAME}:`;
  const whatsappContactMessage =
    "Hola, vi tu perfil en *COMPRAENPEREIRA.COM* y quiero mas informacion.";
  const whatsappContactUrl = business.whatsapp
    ? `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
        whatsappContactMessage,
      )}`
    : null;

  return (
    <>
      <Header />
      <BusinessProfileViewTracker businessId={business.id} />
      <main className="bg-paper">
        <section className="relative bg-brand-deep text-white">
          <div className="relative h-[280px] w-full overflow-hidden sm:h-[380px] lg:h-[420px]">
            {hasCoverImage ? (
              <>
                <BusinessCover
                  businessName={business.name}
                  logo={business.logo}
                  coverImage={business.coverImage}
                  priority
                  imageClassName="object-cover object-center opacity-55"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/35 to-transparent" />
              </>
            ) : business.logo ? (
              <>
                <Image
                  src={business.logo}
                  alt=""
                  fill
                  priority
                  className="scale-110 object-cover object-center blur-xl"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep via-brand-deep/70 to-brand-deep/40" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-deep to-brand" />
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto flex max-w-6xl items-end gap-4 px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8">
              {hasCoverImage ? (
                <BusinessLogo businessName={business.name} logo={business.logo} size="profile" />
              ) : null}
              <div className="min-w-0 pb-1">
                <p className="text-xs font-black uppercase tracking-wide text-gold sm:text-sm">
                  {business.category}
                </p>
                <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-5xl">
                  {business.name}
                </h1>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <article className="md-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <BusinessStatusBadge status={business.status} />
              <span className="text-sm font-semibold text-stone-600">
                Actualizado el {formatDate(business.lastUpdated)}
              </span>
            </div>

            <p className="mt-6 text-lg leading-8 text-stone-700">
              {business.fullDescription ?? business.shortDescription}
            </p>

            <dl className="mt-8 grid gap-4">
              {business.address ? (
                <InfoRow label="Direccion" value={business.address} />
              ) : null}
              {business.schedule ? (
                <InfoRow label="Horario" value={business.schedule} />
              ) : null}
            </dl>

            <div className="mt-8 rounded-2xl bg-[var(--md-primary-container)] p-4 text-sm leading-6 text-[var(--md-on-primary-container)]">
              La informacion de contacto y atencion fue suministrada por el
              establecimiento. Las compras, pagos, entregas y garantias se
              acuerdan directamente con cada comercio.
            </div>

            {products.length > 0 ? (
              <section className="mt-8 border-t border-stone-200 pt-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                      Catalogo
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-extrabold">Productos</h2>
                  </div>
                  <Link
                    className="text-sm font-black text-brand hover:underline"
                    href={`/comercios/${business.slug}/productos`}
                  >
                    Ver todos los productos
                  </Link>
                </div>
                <div className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  {products.slice(0, PRODUCT_CAROUSEL_LIMIT).map((product) => (
                    <Link
                      className="group w-[65%] shrink-0 snap-start overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:w-52"
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
                        <h3 className="text-lg font-black group-hover:underline">
                          {product.name}
                        </h3>
                        <p className="line-clamp-2 text-sm font-semibold leading-6 text-stone-600">
                          {product.shortDescription}
                        </p>
                        <p className="text-sm font-black text-brand">
                          {formatProductPrice(product)}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <Link
                    href={`/comercios/${business.slug}/productos`}
                    className="flex w-[65%] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] sm:w-52"
                  >
                    <span className="grid size-14 place-items-center rounded-full bg-brand-soft text-brand-deep">
                      <SeeMoreIcon className="size-6" />
                    </span>
                    <span className="text-sm font-black text-brand-deep">
                      {products.length > PRODUCT_CAROUSEL_LIMIT ? "Ver mas" : "Ver todos"}
                    </span>
                  </Link>
                </div>
              </section>
            ) : null}
          </article>

          <aside className="space-y-4">
            <div className="md-surface p-5">
              <h2 className="font-display text-lg font-bold text-ink">Contacto</h2>
              <div className="mt-4 flex flex-col gap-3">
                {whatsappContactUrl ? (
                  <TrackedBusinessLink
                    businessId={business.id}
                    eventType="click_whatsapp"
                    href={whatsappContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-between gap-2 rounded-full bg-[#25d366] px-5 text-sm font-black text-ink shadow-sm transition hover:bg-[#1fb457] hover:shadow-md"
                  >
                    Escribir por WhatsApp
                    <WhatsAppIcon className="size-5 shrink-0" />
                  </TrackedBusinessLink>
                ) : null}
                {business.phone ? (
                  <TrackedBusinessLink
                    businessId={business.id}
                    eventType="click_phone"
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className="md-outlined-button justify-between gap-2 px-5 text-sm"
                  >
                    Llamar
                    <PhoneIcon className="size-4 shrink-0" />
                  </TrackedBusinessLink>
                ) : null}
                {business.mapsUrl && isSafeExternalUrl(business.mapsUrl) ? (
                  <TrackedBusinessLink
                    businessId={business.id}
                    eventType="click_maps"
                    href={business.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md-outlined-button justify-between gap-2 px-5 text-sm"
                  >
                    Abrir Google Maps
                    <MapPinIcon className="size-4 shrink-0" />
                  </TrackedBusinessLink>
                ) : null}
              </div>
              <div className="mt-4">
                <SocialLinks business={business} />
              </div>
            </div>

            <div className="md-surface p-5">
              <h2 className="font-display text-lg font-bold text-ink">Compartir</h2>
              <div className="mt-4">
                <ShareButtons
                  title={`${business.name} | ${SITE_NAME}`}
                  text={shareText}
                  url={profileUrl}
                />
              </div>
            </div>

            <Link
              href="/comercios"
              className="inline-flex min-h-11 items-center rounded-full px-1 text-sm font-black text-brand underline-offset-4 hover:underline"
            >
              Volver al directorio
            </Link>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-black uppercase tracking-wide text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold text-ink">{value}</dd>
    </div>
  );
}

function SeeMoreIcon({ className }: { className?: string }) {
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.73.45 3.42 1.32 4.9L2 22l5.31-1.39a9.9 9.9 0 0 0 4.72 1.2h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.83 14.13c-.25.7-1.24 1.28-2.03 1.45-.55.12-1.26.21-3.67-.79-3.08-1.27-5.06-4.39-5.21-4.6-.15-.2-1.25-1.66-1.25-3.17 0-1.5.79-2.24 1.07-2.55.28-.31.61-.38.81-.38.2 0 .41 0 .59.01.19.01.44-.07.69.53.25.6.86 2.08.94 2.23.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.31.4-.44.54-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.66-.08.18-.2.76-.89.97-1.19.2-.3.41-.25.68-.15.28.1 1.75.83 2.05.98.3.15.5.23.58.36.08.13.08.74-.17 1.44Z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
