import Link from "next/link";

export function CategoryGrid({
  categories,
}: {
  categories: Array<{ name: string; count: number }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.name}
          href={`/comercios?categoria=${encodeURIComponent(category.name)}`}
          className="group rounded-lg border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#B3262E] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B3262E] focus:ring-offset-2"
        >
          <span className="text-sm font-black uppercase tracking-wide text-[#B3262E]">
            {category.count} comercio{category.count === 1 ? "" : "s"}
          </span>
          <h2 className="mt-3 text-2xl font-black text-[#22211f]">
            {category.name}
          </h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Ver negocios aliados de {category.name.toLowerCase()}.
          </p>
        </Link>
      ))}
    </div>
  );
}
