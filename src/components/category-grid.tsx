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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/comercios?categoria=${encodeURIComponent(category.name)}`}
          className="md-focus group flex min-h-[112px] flex-col justify-between rounded-2xl border border-stone-200 bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#B3262E]/30 hover:shadow-md active:translate-y-0 sm:min-h-[132px] sm:p-4"
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3bd] text-xl"
            >
              {category.icon}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-black leading-5 text-[#22211f] sm:text-base">
                {category.name}
              </h2>
              <p className="mt-1 text-xs font-black uppercase text-[#B3262E]">
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
