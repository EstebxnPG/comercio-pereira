import Link from "next/link";
import { moderateBusinessAction } from "@/app/admin/negocios/actions";
import { requireAdmin } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/constants";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import type { BusinessStatus } from "@/types/business";

type AdminBusinessesPageProps = {
  searchParams: Promise<{ publicado?: string | string[]; verificado?: string | string[] }>;
};

export default async function AdminBusinessesPage(props: AdminBusinessesPageProps) {
  await requireAdmin();
  const searchParams = await props.searchParams;
  const published = parseTriState(getSingleParam(searchParams.publicado));
  const verified = parseTriState(getSingleParam(searchParams.verificado));
  const businesses = await getAdminBusinesses({ published, verified });

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link className="text-sm font-black text-brand hover:underline" href="/admin">
              Volver al admin
            </Link>
            <h1 className="mt-3 font-display text-3xl font-extrabold">Negocios</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Listado global con moderacion: ocultar, verificar y destacar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="md-outlined-button px-4" href="/admin/postulaciones">
              Postulaciones
            </Link>
            <Link className="md-outlined-button px-4" href="/admin/productos">
              Productos
            </Link>
          </div>
        </header>

        <form
          action="/admin/negocios"
          className="grid gap-3 rounded-xl border border-stone-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="grid gap-2 text-sm font-black text-stone-800">
            Publicacion
            <select className="md-field" defaultValue={published} name="publicado">
              <option value="all">Todos</option>
              <option value="yes">Publicados</option>
              <option value="no">Ocultos</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-black text-stone-800">
            Verificacion
            <select className="md-field" defaultValue={verified} name="verificado">
              <option value="all">Todos</option>
              <option value="yes">Verificados</option>
              <option value="no">Sin verificar</option>
            </select>
          </label>
          <button className="md-filled-button px-5" type="submit">
            Filtrar
          </button>
        </form>

        <section className="grid gap-3">
          {businesses.length === 0 ? (
            <div className="md-surface p-6 text-sm font-semibold text-stone-600">
              No hay negocios que coincidan con el filtro.
            </div>
          ) : (
            businesses.map((business) => (
              <article
                className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]"
                key={business.id}
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                    {business.categoryName}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold">{business.name}</h2>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                    <Badge>{STATUS_LABELS[business.status as BusinessStatus] ?? business.status}</Badge>
                    <Badge>{business.published ? "Publicado" : "Oculto"}</Badge>
                    {business.verified ? <Badge>Verificado</Badge> : null}
                    {business.featured ? <Badge>Destacado</Badge> : null}
                    {business.suspended ? <Badge>Suspendido</Badge> : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <ModerationButton
                    action={business.published ? "unpublish" : "publish"}
                    businessId={business.id}
                    label={business.published ? "Ocultar" : "Publicar"}
                  />
                  <ModerationButton
                    action={business.verified ? "unverify" : "verify"}
                    businessId={business.id}
                    label={business.verified ? "Quitar verificado" : "Verificar"}
                  />
                  <ModerationButton
                    action={business.featured ? "unfeature" : "feature"}
                    businessId={business.id}
                    label={business.featured ? "Quitar destacado" : "Destacar"}
                  />
                  <span
                    className="rounded-full border border-dashed border-stone-300 px-4 py-2 text-xs font-black text-stone-400"
                    title="Requiere aplicar la migracion pendiente (columna businesses.suspended)"
                  >
                    {business.suspended ? "Reactivar" : "Suspender"} (pendiente)
                  </span>
                  <Link
                    className="md-outlined-button px-4 text-sm"
                    href={`/admin/negocios/${business.id}`}
                  >
                    Ver detalle
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function ModerationButton({
  action,
  businessId,
  label,
}: {
  action: string;
  businessId: string;
  label: string;
}) {
  return (
    <form action={moderateBusinessAction}>
      <input name="businessId" type="hidden" value={businessId} />
      <input name="action" type="hidden" value={action} />
      <button className="md-outlined-button px-4 text-sm" type="submit">
        {label}
      </button>
    </form>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-soft px-3 py-1 text-brand-deep">{children}</span>
  );
}

async function getAdminBusinesses({
  published,
  verified,
}: {
  published: "all" | "yes" | "no";
  verified: "all" | "yes" | "no";
}) {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return [];
  }

  // "suspended" is intentionally left out of the select: the column only
  // exists once supabase/migrations/20260924120000_team_and_business_moderation.sql
  // has been applied. Every business reads as not-suspended until then.
  let request = supabase
    .from("businesses")
    .select(
      `
        id,
        name,
        status,
        published,
        verified,
        featured,
        updated_at,
        categories(name)
      `,
    )
    .order("updated_at", { ascending: false })
    .limit(150);

  if (published !== "all") {
    request = request.eq("published", published === "yes");
  }

  if (verified !== "all") {
    request = request.eq("verified", verified === "yes");
  }

  const { data, error } = await request;

  if (error) {
    console.error("Admin businesses query failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    status: row.status as string,
    published: Boolean(row.published),
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    suspended: false,
    categoryName: getCategoryName(row.categories),
  }));
}

function getCategoryName(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.name === "string" ? value[0].name : "Sin categoria";
  }

  return typeof (value as { name?: unknown } | null)?.name === "string"
    ? (value as { name: string }).name
    : "Sin categoria";
}

function parseTriState(value: string | undefined): "all" | "yes" | "no" {
  return value === "yes" || value === "no" ? value : "all";
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
