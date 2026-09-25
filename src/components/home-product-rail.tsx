import Link from "next/link";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { ProductCard } from "@/components/product-card";
import type { PublicProduct } from "@/lib/products";

export function HomeProductRail({
  description,
  eyebrow,
  href,
  linkLabel,
  products,
  title,
}: {
  description?: string;
  eyebrow: string;
  href: string;
  linkLabel: string;
  products: PublicProduct[];
  title: string;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-brand">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl font-extrabold leading-tight text-ink sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 max-w-2xl leading-7 text-stone-600">
                {description}
              </p>
            ) : null}
          </div>
          <Link
            href={href}
            className="inline-flex min-h-11 items-center text-sm font-black text-brand underline-offset-4 hover:underline"
          >
            {linkLabel}
          </Link>
        </div>
        <AutoScrollCarousel className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[45%] shrink-0 snap-start sm:w-auto"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </AutoScrollCarousel>
      </div>
    </section>
  );
}
