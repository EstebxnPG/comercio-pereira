import Image from "next/image";
import Link from "next/link";
import type { Business } from "@/types/business";

export function BrandBubble({ business }: { business: Business }) {
  return (
    <Link
      href={`/comercios/${business.slug}`}
      className="md-focus group flex min-w-[84px] shrink-0 snap-start flex-col items-center gap-1.5 sm:min-w-[100px]"
    >
      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-white shadow-[0_4px_14px_rgb(36_21_18/0.14)] transition group-hover:shadow-[0_6px_18px_rgb(36_21_18/0.2)] sm:size-20">
        {business.logo ? (
          <Image src={business.logo} alt="" fill className="object-contain p-2.5" sizes="80px" />
        ) : (
          <span className="grid h-full place-items-center font-display text-sm font-bold text-brand">
            {business.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className="line-clamp-1 max-w-20 text-center text-xs font-bold text-ink">
        {business.name}
      </span>
    </Link>
  );
}
