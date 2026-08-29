import Link from "next/link";
import { BusinessLogo } from "@/components/business-logo";
import type { Business } from "@/types/business";

export function BrandRail({ businesses }: { businesses: Business[] }) {
  if (businesses.length === 0) {
    return null;
  }

  const marqueeBusinesses = [...businesses, ...businesses];

  return (
    <section className="bg-[#fbfaf7] py-9 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#B3262E]">
              Comercios en la red
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-[#22211f] sm:text-3xl">
              Marcas que ya encuentras aqui
            </h2>
          </div>
          <Link
            href="/comercios"
            className="inline-flex min-h-10 items-center text-sm font-black text-[#B3262E] underline-offset-4 hover:underline"
          >
            Ver comercios
          </Link>
        </div>

        <div className="brand-rail-mask mt-6 overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] sm:overflow-hidden sm:pb-0">
          <div className="brand-rail-track flex w-max gap-3 sm:gap-4">
            {marqueeBusinesses.map((business, index) => (
              <Link
                key={`${business.id}-${index}`}
                href={`/comercios/${business.slug}`}
                className="md-focus group flex min-w-[128px] snap-start flex-col items-center gap-2 rounded-2xl border border-stone-200 bg-white p-3 text-center shadow-sm transition hover:border-[#B3262E]/30 hover:shadow-md sm:min-w-[160px]"
              >
                <BusinessLogo
                  businessName={business.name}
                  logo={business.logo}
                  size="rail"
                />
                <span className="line-clamp-1 max-w-32 text-xs font-black text-[#22211f]">
                  {business.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
