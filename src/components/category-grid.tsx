import Link from "next/link";

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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/comercios?categoria=${encodeURIComponent(category.name)}`}
          className="md-surface md-focus group flex min-h-40 flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#ffdad8] text-2xl"
            >
              {category.icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-black leading-5 text-[#22211f]">
                {category.name}
              </h2>
              <p className="mt-1 text-xs font-black uppercase tracking-wide text-[#B3262E]">
                {category.count} comercio{category.count === 1 ? "" : "s"}
              </p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-5 text-stone-600">
            {category.description}
          </p>
        </Link>
      ))}
    </div>
  );
}
