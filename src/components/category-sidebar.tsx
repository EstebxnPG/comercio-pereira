import Link from "next/link";
import { CategoryIcon } from "@/components/icons/category-icons";
import { getShortCategoryLabel } from "@/lib/category-labels";

export function CategorySidebar({
  categories,
  selectedCategory,
}: {
  categories: string[];
  selectedCategory: string;
}) {
  return (
    <nav
      aria-label="Categorias"
      className="sticky top-16 flex h-[calc(100vh-4rem)] w-20 shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--md-outline-variant)] bg-paper px-1.5 py-3 sm:w-24 sm:px-2"
    >
      {categories.map((category) => {
        const active = category === selectedCategory;

        return (
          <Link
            key={category}
            href={`/categorias?categoria=${encodeURIComponent(category)}`}
            className={`md-focus flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-center transition ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-stone-600 hover:bg-[var(--md-surface-container)]"
            }`}
          >
            <CategoryIcon
              name={category}
              className={`size-5 ${active ? "text-white" : "text-stone-500"}`}
            />
            <span className="text-[11px] font-bold leading-tight">
              {getShortCategoryLabel(category)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
