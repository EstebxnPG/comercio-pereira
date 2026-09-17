import Link from "next/link";
import { CategoryIcon } from "@/components/icons/category-icons";

export function CategoryGrid({
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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/comercios?categoria=${encodeURIComponent(category.name)}`}
          className="md-focus group flex min-h-[128px] flex-col justify-between rounded-2xl border border-[var(--md-outline-variant)] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md active:translate-y-0 sm:min-h-[144px] sm:p-4"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--md-surface-container)] ring-1 ring-black/5"
            >
              <CategoryIcon name={category.name} className="size-6" />
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-sm font-bold leading-5 text-ink sm:text-base">
                {category.name}
              </h2>
              <p className="mt-1.5 inline-flex items-center rounded-full bg-gold-soft px-2 py-0.5 font-mono text-[11px] font-bold text-gold-ink">
                {category.count} comercio{category.count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <p className="mt-2 hidden line-clamp-2 text-sm leading-5 text-stone-600 sm:block">
            {category.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
