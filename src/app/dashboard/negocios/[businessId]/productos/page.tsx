import Link from "next/link";
import { requireBusinessRole } from "@/lib/auth";
import {
  PRODUCT_AVAILABILITY_LABELS,
  PRODUCT_STATUS_LABELS,
  type ProductAvailability,
  type ProductStatus,
  formatProductPrice,
} from "@/lib/products";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ProductsPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function BusinessProductsPage(props: ProductsPageProps) {
  const { businessId } = await props.params;
  await requireBusinessRole(businessId, ["owner", "manager", "editor", "viewer"]);
  const { business, products } = await getBusinessProducts(businessId);

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-black text-[#B3262E] hover:underline"
              href={`/dashboard/negocios/${businessId}`}
            >
              Volver al perfil
            </Link>
            <h1 className="mt-3 text-3xl font-black">Productos</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              {business?.name ?? "Negocio"} puede preparar borradores y enviar
              productos a revision.
            </p>
          </div>
          <Link
            className="md-filled-button px-5"
            href={`/dashboard/negocios/${businessId}/productos/nuevo`}
          >
            Nuevo producto
          </Link>
        </header>

        {products.length === 0 ? (
          <section className="md-surface grid gap-3 p-6">
            <h2 className="text-xl font-black">Aun no hay productos</h2>
            <p className="max-w-2xl text-sm font-semibold leading-6 text-stone-600">
              Crea el primer producto como borrador o envialo a revision para
              que admin lo apruebe y aparezca publicamente.
            </p>
          </section>
        ) : (
          <section className="grid gap-3">
            {products.map((product) => (
              <article
                className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-[112px_1fr_auto]"
                key={product.id}
              >
                <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-stone-100">
                  {product.primary_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={product.primary_image_url}
                    />
                  ) : (
                    <span className="px-3 text-center text-xs font-black uppercase text-stone-500">
                      Sin imagen
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{PRODUCT_STATUS_LABELS[product.status as ProductStatus]}</Badge>
                    <Badge>
                      {
                        PRODUCT_AVAILABILITY_LABELS[
                          product.availability as ProductAvailability
                        ]
                      }
                    </Badge>
                  </div>
                  <h2 className="mt-3 text-xl font-black">{product.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-stone-600">
                    {product.short_description}
                  </p>
                  <p className="mt-2 text-sm font-black text-[#B3262E]">
                    {formatProductPrice({
                      currency: product.currency,
                      priceCents: product.price_cents,
                      priceLabel: product.price_label,
                    })}
                  </p>
                </div>
                <div className="flex items-center sm:justify-end">
                  <Link
                    className="md-outlined-button px-4"
                    href={`/dashboard/negocios/${businessId}/productos/${product.id}`}
                  >
                    Editar
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#ffdad8] px-3 py-1 text-xs font-black text-[#410006]">
      {children}
    </span>
  );
}

async function getBusinessProducts(businessId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { business: null, products: [] };
  }

  const [{ data: business }, { data: products, error }] = await Promise.all([
    supabase.from("businesses").select("name").eq("id", businessId).maybeSingle(),
    supabase
      .from("products")
      .select(
        `
          id,
          name,
          short_description,
          price_cents,
          currency,
          price_label,
          status,
          availability,
          primary_image_url,
          updated_at
        `,
      )
      .eq("business_id", businessId)
      .order("updated_at", { ascending: false }),
  ]);

  if (error) {
    return { business, products: [] };
  }

  return { business, products };
}
