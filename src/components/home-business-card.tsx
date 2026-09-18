import Link from "next/link";
import { BusinessCover } from "@/components/business-cover";
import { BusinessLogo } from "@/components/business-logo";
import { BusinessStatusBadge } from "@/components/business-status";
import type { Business } from "@/types/business";

export function HomeBusinessCard({ business }: { business: Business }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--md-outline-variant)]/70 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/comercios/${business.slug}`} className="md-focus block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <BusinessCover
            businessName={business.name}
            logo={business.logo}
            coverImage={business.coverImage}
            imageClassName="object-cover"
            sizes="(min-width: 640px) 33vw, 86vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2">
            <BusinessLogo businessName={business.name} logo={business.logo} size="card" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
              {business.category}
            </p>
            <BusinessStatusBadge status={business.status} />
          </div>
          <h3 className="mt-2 font-display text-lg font-bold leading-tight text-ink">
            {business.name}
          </h3>
          <p className="mt-2 flex min-h-5 items-center gap-1.5 text-sm text-stone-600">
            {business.address ? (
              <>
                <PinIcon className="size-4 shrink-0 text-stone-400" />
                <span className="truncate">{business.address}</span>
              </>
            ) : business.status === "remote_attention" ? (
              <>
                <PinIcon className="size-4 shrink-0 text-stone-400" />
                <span className="truncate">Atencion remota</span>
              </>
            ) : null}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm font-black text-brand">
            Ver perfil
            <ArrowRightIcon className="size-4" />
          </p>
        </div>
      </Link>
    </article>
  );
}

function PinIcon({ className }: { className?: string }) {
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

function ArrowRightIcon({ className }: { className?: string }) {
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
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
