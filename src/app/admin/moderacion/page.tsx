import Link from "next/link";
import { moderateProductAction } from "@/app/admin/productos/actions";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

export default async function AdminModerationPage() {
  await requireAdmin();
  const products = await getPendingProducts();

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link className="text-sm font-black text-brand hover:underline" href="/admin">
            Volver al admin
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Moderacion</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
            Productos enviados por comercios y pendientes de decision editorial.
          </p>
        </header>

        {products.length === 0 ? (
          <section className="md-surface p-6">
            <h2 className="font-display text-xl font-bold">No hay pendientes</h2>
            <p className="mt-2 text-sm font-semibold text-stone-600">
              La cola de revision esta limpia.
            </p>
          </section>
        ) : (
          <section className="grid gap-3">
            {products.map((product) => (
              <article
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
                key={product.id}
              >
                <div className="grid gap-4 sm:grid-cols-[96px_1fr_auto]">
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
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                      {getBusinessName(product.businesses)}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-bold">{product.name}</h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-stone-600">
                      {product.short_description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <ModerationButton action="approve" label="Aprobar" productId={product.id} />
                    <ModerationButton action="reject" label="Rechazar" productId={product.id} />
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
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

async function getPendingProducts() {
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
        primary_image_url,
        updated_at,
        businesses(name)
      `,
    )
    .eq("moderation_status", "pending")
    .order("updated_at", { ascending: true });

  if (error) {
    console.error("Pending moderation query failed", error);
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
