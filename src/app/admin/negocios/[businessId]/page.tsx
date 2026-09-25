import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { STATUS_LABELS } from "@/lib/constants";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";
import { getBusinessTeam } from "@/lib/team-members";
import type { BusinessStatus } from "@/types/business";

const ROLE_LABELS: Record<string, string> = {
  editor: "Editor",
  manager: "Gerente",
  owner: "Propietario",
  viewer: "Solo lectura",
};

type AdminBusinessDetailPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function AdminBusinessDetailPage(
  props: AdminBusinessDetailPageProps,
) {
  const { businessId } = await props.params;
  const { user } = await requireAdmin();
  const business = await getAdminBusiness(businessId);

  if (!business) {
    notFound();
  }

  const [team, auditLogs] = await Promise.all([
    getBusinessTeam(businessId, user.id),
    getBusinessAuditLogs(businessId),
  ]);

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link className="text-sm font-black text-brand hover:underline" href="/admin/negocios">
            Volver a negocios
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold">{business.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            <Badge>{STATUS_LABELS[business.status as BusinessStatus] ?? business.status}</Badge>
            <Badge>{business.published ? "Publicado" : "Oculto"}</Badge>
            {business.verified ? <Badge>Verificado</Badge> : null}
            {business.featured ? <Badge>Destacado</Badge> : null}
          </div>
        </header>

        <section className="md-surface grid gap-4 p-5">
          <h2 className="font-display text-xl font-bold">Equipo</h2>
          {team.length === 0 ? (
            <p className="text-sm font-semibold text-stone-600">
              Sin miembros registrados.
            </p>
          ) : (
            <ul className="grid gap-2">
              {team.map((member) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-paper px-4 py-3 text-sm font-semibold"
                  key={member.id}
                >
                  <span className="truncate">{member.email ?? "Sin correo"}</span>
                  <span className="text-xs font-black uppercase tracking-wide text-stone-500">
                    {member.status === "invited" ? "Invitacion pendiente" : "Activo"} ·{" "}
                    {ROLE_LABELS[member.role] ?? member.role}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="md-surface grid gap-4 p-5">
          <h2 className="font-display text-xl font-bold">Auditoria reciente</h2>
          {auditLogs.length === 0 ? (
            <p className="text-sm font-semibold text-stone-600">
              Sin registros de auditoria todavia.
            </p>
          ) : (
            <ul className="grid gap-2">
              {auditLogs.map((log) => (
                <li
                  className="rounded-xl border border-stone-200 bg-paper px-4 py-3 text-sm font-semibold"
                  key={log.id}
                >
                  <p className="font-mono text-xs font-bold uppercase tracking-wide text-brand-deep">
                    {log.action}
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(log.created_at).toLocaleString("es-CO")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-soft px-3 py-1 text-brand-deep">{children}</span>
  );
}

async function getAdminBusiness(businessId: string) {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, status, published, verified, featured")
    .eq("id", businessId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getBusinessAuditLogs(businessId: string) {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("business_audit_logs")
    .select("id, action, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return [];
  }

  return data ?? [];
}
