import Link from "next/link";
import { moderateProductAction } from "@/app/admin/productos/actions";
import { requireAdmin } from "@/lib/auth";
import {
  PRODUCT_STATUS_LABELS,
  type ProductStatus,
  formatProductPrice,
} from "@/lib/products";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAdminProducts();

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="text-sm font-black text-[#B3262E] hover:underline" href="/admin">
              Volver al admin
            </Link>
            <h1 className="mt-3 text-3xl font-black">Productos</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Cola global de productos con moderacion y publicacion.
            </p>
          </div>
          <Link className="md-outlined-button px-4" href="/admin/moderacion">
            Ver pendientes
          </Link>
        </header>

        <section className="grid gap-3">
          {products.map((product) => (
            <article
              className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-[96px_1fr_auto]"
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
                  <span className="px-2 text-center text-xs font-black uppercase text-stone-500">
                    Sin imagen
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-[#B3262E]">
                  {getBusinessName(product.businesses)}
                </p>
                <h2 className="mt-1 text-xl font-black">{product.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-stone-600">
                  {product.short_description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <Badge>{PRODUCT_STATUS_LABELS[product.status as ProductStatus]}</Badge>
                  <Badge>{product.moderation_status}</Badge>
                  <Badge>
                    {formatProductPrice({
                      currency: product.currency,
                      priceCents: product.price_cents,
                      priceLabel: product.price_label,
                    })}
                  </Badge>
                  {product.featured ? <Badge>Destacado</Badge> : null}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                <ModerationButton action="approve" label="Aprobar" productId={product.id} />
                <ModerationButton action="reject" label="Rechazar" productId={product.id} />
                <ModerationButton action="hide" label="Ocultar" productId={product.id} />
                <ModerationButton
                  action="feature"
                  label={product.featured ? "Quitar destacado" : "Destacar"}
                  productId={product.id}
                />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function ModerationButton({
  action,
  label,
  productId,
}: {
  action: string;
  label: string;
  productId: string;
}) {
  return (
    <form action={moderateProductAction}>
      <input name="productId" type="hidden" value={productId} />
      <button className="md-outlined-button px-4 text-sm" name="action" type="submit" value={action}>
        {label}
      </button>
    </form>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#ffdad8] px-3 py-1 text-[#410006]">
      {children}
    </span>
  );
}

async function getAdminProducts() {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
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
        moderation_status,
        primary_image_url,
        featured,
        updated_at,
        businesses(name)
      `,
    )
    .order("updated_at", { ascending: false })
    .limit(80);

  if (error) {
    console.error("Admin products query failed", error);
    return [];
  }

  return data;
}

function getBusinessName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.name === "string" ? value[0].name : "Comercio";
  }

  return typeof (value as { name?: unknown } | null)?.name === "string"
    ? (value as { name: string }).name
    : "Comercio";
}
