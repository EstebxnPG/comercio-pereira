import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessStatusBadge } from "@/components/business-status";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ShareButtons } from "@/components/share-buttons";
import { SocialLinks } from "@/components/social-links";
import { getBusinessBySlug, getPublishedBusinesses } from "@/lib/businesses";
import { SITE_NAME, STATUS_LABELS } from "@/lib/constants";
import { absoluteUrl, formatDate, isSafeExternalUrl } from "@/lib/utils";

export function generateStaticParams() {
  return getPublishedBusinesses().map((business) => ({
    slug: business.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<"/comercios/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const business = getBusinessBySlug(slug);

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
  const business = getBusinessBySlug(slug);

  if (!business) {
    notFound();
  }

  const profileUrl = absoluteUrl(`/comercios/${business.slug}`);
  const shareText = `El centro sigue latiendo\n\nConoce a ${business.name}, comercio aliado de ${SITE_NAME}:`;
  const whatsappContactUrl = business.whatsapp
    ? `https://wa.me/${business.whatsapp}`
    : null;

  return (
    <>
      <Header />
      <main className="bg-[#fbfaf7]">
        <section className="relative bg-[#7F1D1D] text-white">
          <div className="relative aspect-[16/9] max-h-[420px] min-h-[260px] overflow-hidden">
            <Image
              src={business.coverImage}
              alt={`Portada de ${business.name}`}
              fill
              priority
              className="object-cover opacity-55"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#7F1D1D] via-[#7F1D1D]/35 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto flex max-w-6xl items-end gap-4 px-4 pb-6 sm:px-6 lg:px-8">
              <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:size-28">
                <Image
                  src={business.logo}
                  alt={`Logo de ${business.name}`}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="min-w-0 pb-1">
                <p className="text-sm font-black uppercase tracking-wide text-[#f5c84c]">
                  {business.category}
                </p>
                <h1 className="mt-1 text-3xl font-black leading-tight sm:text-5xl">
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
          </article>

          <aside className="space-y-4">
            <div className="md-surface p-5">
              <h2 className="text-lg font-black text-[#22211f]">Contacto</h2>
              <div className="mt-4 flex flex-col gap-3">
                {whatsappContactUrl ? (
                  <a
                    href={whatsappContactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#25d366] px-5 text-sm font-black text-[#22211f] shadow-sm transition hover:bg-[#1fb457] hover:shadow-md"
                  >
                    Escribir por WhatsApp
                  </a>
                ) : null}
                {business.phone ? (
                  <a
                    href={`tel:${business.phone.replace(/\s/g, "")}`}
                    className="md-outlined-button px-5 text-sm"
                  >
                    Llamar
                  </a>
                ) : null}
                {business.mapsUrl && isSafeExternalUrl(business.mapsUrl) ? (
                  <a
                    href={business.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="md-outlined-button px-5 text-sm"
                  >
                    Abrir Google Maps
                  </a>
                ) : null}
              </div>
              <div className="mt-4">
                <SocialLinks business={business} />
              </div>
            </div>

            <div className="md-surface p-5">
              <h2 className="text-lg font-black text-[#22211f]">Compartir</h2>
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
              className="inline-flex min-h-11 items-center rounded-full px-1 text-sm font-black text-[#B3262E] underline-offset-4 hover:underline"
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
      <dd className="mt-1 text-base font-semibold text-[#22211f]">{value}</dd>
    </div>
  );
}
