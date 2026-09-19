import Link from "next/link";
import { requireBusinessRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type StatsPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function BusinessStatsPage(props: StatsPageProps) {
  const { businessId } = await props.params;
  await requireBusinessRole(businessId, ["owner", "manager", "viewer"]);
  const stats = await getBusinessStats(businessId);

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link
            className="text-sm font-black text-[#B3262E] hover:underline"
            href={`/dashboard/negocios/${businessId}`}
          >
            Volver al perfil
          </Link>
          <h1 className="mt-3 text-3xl font-black">Estadisticas</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
            Lectura base de los ultimos 30 dias usando agregados diarios.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Vistas perfil" value={stats.profileViews} />
          <Metric label="Vistas productos" value={stats.productViews} />
          <Metric label="Productos con descuento" value={stats.discountedProductViews} />
          <Metric label="WhatsApp" value={stats.whatsappClicks} />
          <Metric label="Otros clics" value={stats.otherClicks} />
          <Metric label="Vistas promos" value={stats.promotionViews} />
          <Metric label="Clics promos" value={stats.promotionClicks} />
        </section>

        <section className="md-surface p-5">
          <h2 className="text-xl font-black">Productos con mas actividad</h2>
          {stats.products.length === 0 ? (
            <p className="mt-3 text-sm font-semibold text-stone-600">
              Aun no hay eventos suficientes para rankear productos.
            </p>
          ) : (
            <div className="mt-4 grid gap-3">
              {stats.products.map((product) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0"
                  key={product.product_id}
                >
                  <span className="font-black">{product.name}</span>
                  <span className="text-sm font-black text-[#B3262E]">
                    {product.product_views} vistas
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="md-surface p-5">
      <p className="text-xs font-black uppercase text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-[#B3262E]">{value}</p>
    </div>
  );
}

async function getBusinessStats(businessId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return emptyStats();
  }

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 30);

  const [{ data: daily }, { data: products }] = await Promise.all([
    supabase
      .from("analytics_daily_business")
      .select(
        "profile_views, product_views, discounted_product_views, whatsapp_clicks, phone_clicks, website_clicks, social_clicks, share_events, promotion_views, promotion_clicks",
      )
      .eq("business_id", businessId)
      .gte("event_date", fromDate.toISOString().slice(0, 10)),
    supabase
      .from("analytics_daily_product")
      .select("product_id, product_views, discounted_product_views, products(name)")
      .eq("business_id", businessId)
      .gte("event_date", fromDate.toISOString().slice(0, 10))
      .order("product_views", { ascending: false })
      .limit(8),
  ]);

  return {
    discountedProductViews: sum(daily, "discounted_product_views"),
    otherClicks: sum(daily, "phone_clicks") + sum(daily, "website_clicks") + sum(daily, "social_clicks"),
    productViews: sum(daily, "product_views"),
    products: (products ?? []).map((product) => ({
      discounted_product_views: product.discounted_product_views,
      name: getProductName(product.products),
      product_id: product.product_id,
      product_views: product.product_views,
    })),
    profileViews: sum(daily, "profile_views"),
    promotionClicks: sum(daily, "promotion_clicks"),
    promotionViews: sum(daily, "promotion_views"),
    whatsappClicks: sum(daily, "whatsapp_clicks"),
  };
}

function emptyStats() {
  return {
    discountedProductViews: 0,
    otherClicks: 0,
    productViews: 0,
    products: [],
    profileViews: 0,
    promotionClicks: 0,
    promotionViews: 0,
    whatsappClicks: 0,
  };
}

function sum(rows: Array<Record<string, unknown>> | null, key: string) {
  return (rows ?? []).reduce((total, row) => total + Number(row[key] ?? 0), 0);
}

function getProductName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.name === "string" ? value[0].name : "Producto";
  }

  return typeof (value as { name?: unknown } | null)?.name === "string"
    ? (value as { name: string }).name
    : "Producto";
}
