import Link from "next/link";
import { BusinessCover } from "@/components/business-cover";
import { BusinessLogo } from "@/components/business-logo";
import { BusinessStatusBadge } from "@/components/business-status";
import type { Business } from "@/types/business";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgb(34_21_20/0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-[#B3262E]/25 hover:shadow-[0_16px_34px_rgb(34_21_20/0.12)]">
      <Link
        href={`/comercios/${business.slug}`}
        className="md-focus grid h-full grid-cols-[112px_1fr] sm:block"
      >
        <div className="relative min-h-[156px] overflow-hidden bg-stone-100 sm:aspect-[16/10] sm:min-h-0">
          <BusinessCover
            businessName={business.name}
            logo={business.logo}
            coverImage={business.coverImage}
            imageClassName="object-cover transition duration-500 group-hover:scale-[1.035]"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute bottom-3 left-3 scale-90 origin-bottom-left sm:scale-100">
            <BusinessLogo
              businessName={business.name}
              logo={business.logo}
              size="card"
            />
          </div>
        </div>
        <div className="min-w-0 p-3 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="min-w-0 truncate text-xs font-black uppercase text-[#B3262E]">
              {business.category}
            </p>
            <BusinessStatusBadge status={business.status} />
          </div>
          <h2 className="mt-2 line-clamp-2 text-base font-black leading-tight text-[#22211f] sm:text-xl">
            {business.name}
          </h2>
          <p className="mt-2 hidden line-clamp-2 text-sm leading-6 text-stone-600 sm:block">
            {business.shortDescription}
          </p>
          {business.address ? (
            <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-stone-700 sm:mt-3 sm:line-clamp-1 sm:text-sm">
              {business.address}
            </p>
          ) : null}
          <span className="mt-3 inline-flex min-h-9 items-center rounded-full bg-[#fff3bd] px-3 text-xs font-black text-[#5b1b00] transition group-hover:bg-[#f5c84c] sm:mt-4 sm:min-h-10 sm:px-4 sm:text-sm">
            Ver perfil
          </span>
        </div>
      </Link>
    </article>
  );
}
