import Link from "next/link";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { CategoryIcon } from "@/components/icons/category-icons";

export function CategoryQuickGrid({
  categories,
}: {
  categories: Array<{
    name: string;
    icon: string;
    description: string;
    count: number;
  }>;
}) {
  return (
    <AutoScrollCarousel className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/comercios?categoria=${encodeURIComponent(category.name)}`}
          className="md-focus flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl border border-[var(--md-outline-variant)] bg-white p-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md active:translate-y-0 sm:w-auto"
        >
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--md-surface-container)] ring-1 ring-black/5"
          >
            <CategoryIcon name={category.name} className="size-7" />
          </span>
          <span className="line-clamp-2 font-display text-xs font-bold leading-tight text-ink">
            {category.name}
          </span>
        </Link>
      ))}
    </AutoScrollCarousel>
  );
}
