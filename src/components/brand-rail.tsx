import { BrandBubble } from "@/components/brand-bubble";
import type { Business } from "@/types/business";

export function BrandRail({ businesses }: { businesses: Business[] }) {
  if (businesses.length === 0) {
    return null;
  }

  const marqueeBusinesses = [...businesses, ...businesses];
  const durationSeconds = Math.min(240, Math.max(60, businesses.length * 6));

  return (
    <div className="brand-rail-mask overflow-x-auto overscroll-x-contain pb-2 [scrollbar-width:none] sm:overflow-hidden sm:pb-0">
      <div
        className="brand-rail-track flex w-max gap-4 sm:gap-5"
        style={{ animationDuration: `${durationSeconds}s` }}
      >
        {marqueeBusinesses.map((business, index) => (
          <BrandBubble key={`${business.id}-${index}`} business={business} />
        ))}
      </div>
    </div>
  );
}
