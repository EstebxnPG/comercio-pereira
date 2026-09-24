import Link from "next/link";
import { AutoScrollCarousel } from "@/components/auto-scroll-carousel";
import { BrandBubble } from "@/components/brand-bubble";
import { ProductCard } from "@/components/product-card";
import type { PublicProduct } from "@/lib/products";
import type { Business } from "@/types/business";

const FEATURED_COUNT = 2;

export function SubcategoryDirectory({
  backHref,
  brands,
  featuredProductIds,
  products,
}: {
  backHref: string;
  brands: Business[];
  featuredProductIds: string[];
  products: PublicProduct[];
}) {
  if (products.length === 0) {
    return (
      <div className="mt-4">
        <div className="md-surface border-dashed p-6 text-center">
          <p className="font-display text-base font-bold text-ink">
            Aun no hay productos en esta subcategoria.
          </p>
          <p className="mt-1 text-sm text-stone-600">
            Vuelve pronto, los comercios siguen publicando su catalogo.
          </p>
        </div>
        <Link className="md-outlined-button mt-4 px-5" href={backHref}>
          Ver otras subcategorias
        </Link>
      </div>
    );
  }

  const featured = featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is PublicProduct => Boolean(product))
    .slice(0, FEATURED_COUNT);
  const featuredIds = new Set(featured.map((product) => product.id));
  const remaining = products.filter((product) => !featuredIds.has(product.id));

  return (
    <div className="mt-4">
      {featured.length > 0 ? (
        <>
          <p className="text-xs font-black uppercase tracking-wide text-brand-deep">
            Los mas vistos
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : null}

      {brands.length > 0 ? (
        <div className="mt-6">
          <p className="text-xs font-black uppercase tracking-wide text-brand-deep">
            Marcas
          </p>
          <div className="mt-2">
            <AutoScrollCarousel className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none]">
              {brands.map((business) => (
                <BrandBubble key={business.id} business={business} />
              ))}
            </AutoScrollCarousel>
          </div>
        </div>
      ) : null}

      {remaining.length > 0 ? (
        <div className="mt-6">
          {featured.length > 0 ? (
            <p className="text-xs font-black uppercase tracking-wide text-brand-deep">
              Mas productos
            </p>
          ) : null}
          <div className="mt-2 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {remaining.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : null}

      <Link className="md-outlined-button mt-6 px-5" href={backHref}>
        Ver otras subcategorias
      </Link>
    </div>
  );
}
