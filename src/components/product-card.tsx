import Link from "next/link";
import { getProductPriceDisplay } from "@/lib/product-pricing";
import type { PublicProduct } from "@/lib/products";

export function ProductCard({ product }: { product: PublicProduct }) {
  const price = getProductPriceDisplay(product);

  return (
    <Link
      className="group overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      href={`/productos/${product.slug}`}
    >
      <div className="relative grid aspect-[4/3] place-items-center bg-stone-100">
        {price.badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-black text-white shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-xs">
            {price.badge}
          </span>
        ) : null}
        {product.primaryImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-full w-full object-cover"
            src={product.primaryImageUrl}
          />
        ) : (
          <span className="text-xs font-black uppercase text-stone-500">
            Producto local
          </span>
        )}
      </div>
      <div className="grid gap-1 p-3 sm:gap-2 sm:p-4">
        <p className="truncate font-mono text-[10px] font-bold uppercase tracking-wide text-brand-deep sm:text-[11px]">
          {product.businessName}
        </p>
        <h2 className="font-display text-sm font-bold leading-tight group-hover:underline sm:text-xl">
          {product.name}
        </h2>
        <p className="line-clamp-2 hidden text-sm font-semibold leading-6 text-stone-600 sm:block">
          {product.shortDescription}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <p className="text-sm font-black text-ink">{price.current}</p>
          {price.original ? (
            <p className="text-xs font-bold text-stone-500 line-through">
              {price.original}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
