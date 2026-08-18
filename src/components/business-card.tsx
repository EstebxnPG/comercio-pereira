import Image from "next/image";
import Link from "next/link";
import { BusinessStatusBadge } from "@/components/business-status";
import type { Business } from "@/types/business";

export function BusinessCard({ business }: { business: Business }) {
  return (
    <article className="md-surface group overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        href={`/comercios/${business.slug}`}
        className="md-focus block"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-stone-100">
          <Image
            src={business.coverImage}
            alt={`Portada de ${business.name}`}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="p-4">
          <div className="-mt-12 mb-3 flex items-end justify-between gap-3">
            <div className="relative size-20 overflow-hidden rounded-xl border-4 border-white bg-white shadow-sm">
              <Image
                src={business.logo}
                alt={`Logo de ${business.name}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            <BusinessStatusBadge status={business.status} />
          </div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#B3262E]">
            {business.category}
          </p>
          <h2 className="mt-1 text-xl font-black text-[#22211f]">
            {business.name}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">
            {business.shortDescription}
          </p>
          {business.address ? (
            <p className="mt-3 text-sm font-medium text-stone-700">
              {business.address}
            </p>
          ) : null}
          <span className="md-tonal-button mt-5 px-4 text-sm">
            Conocer comercio
          </span>
        </div>
      </Link>
    </article>
  );
}
