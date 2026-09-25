import Link from "next/link";
import {
  inviteTeamMemberAction,
  removeTeamMemberAction,
  updateTeamMemberRoleAction,
} from "@/app/dashboard/negocios/[businessId]/equipo/actions";
import { requireBusinessRole } from "@/lib/auth";
import { getBusinessTeam } from "@/lib/team-members";

const ROLE_LABELS: Record<string, string> = {
  editor: "Editor",
  manager: "Gerente",
  owner: "Propietario",
  viewer: "Solo lectura",
};

type TeamPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function BusinessTeamPage(props: TeamPageProps) {
  const { businessId } = await props.params;
  const { role: viewerRole, user } = await requireBusinessRole(businessId, [
    "owner",
    "manager",
    "editor",
    "viewer",
  ]);
  const team = await getBusinessTeam(businessId, user.id);
  const canManage = viewerRole === "owner";

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link
            className="text-sm font-black text-brand hover:underline"
            href={`/dashboard/negocios/${businessId}`}
          >
            Volver al perfil
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Equipo</h1>
          <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
            {canManage
              ? "Invita personas, cambia roles o remueve el acceso al panel de este negocio."
              : "Solo el propietario puede invitar, cambiar roles o remover acceso."}
          </p>
        </header>

        {canManage ? (
          <form
            action={inviteTeamMemberAction}
            className="md-surface grid gap-4 p-5 sm:grid-cols-[1fr_180px_auto] sm:items-end"
          >
            <input name="businessId" type="hidden" value={businessId} />
            <Field label="Correo">
              <input
                className="md-field"
                name="email"
                placeholder="persona@correo.com"
                required
                type="email"
              />
            </Field>
            <Field label="Rol">
              <select className="md-field" defaultValue="editor" name="role">
                <option value="manager">Gerente</option>
                <option value="editor">Editor</option>
                <option value="viewer">Solo lectura</option>
              </select>
            </Field>
            <button className="md-filled-button px-5" type="submit">
              Invitar
            </button>
          </form>
        ) : null}

        <section className="grid gap-3">
          {team.length === 0 ? (
            <div className="md-surface p-6 text-sm font-semibold text-stone-600">
              Aun no hay miembros registrados.
            </div>
          ) : (
            team.map((member) => (
              <article
                className="md-surface flex flex-wrap items-center justify-between gap-3 p-4"
                key={member.id}
              >
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">
                    {member.email ?? "Sin correo"}
                    {member.isSelf ? (
                      <span className="ml-2 text-xs font-black text-brand">(tu)</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs font-black uppercase tracking-wide text-stone-500">
                    {member.status === "invited" ? "Invitacion pendiente" : "Activo"} ·{" "}
                    {ROLE_LABELS[member.role] ?? member.role}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <form
                      action={updateTeamMemberRoleAction}
                      className="flex items-center gap-2"
                    >
                      <input name="businessId" type="hidden" value={businessId} />
                      <input name="memberId" type="hidden" value={member.id} />
                      <select className="md-field" defaultValue={member.role} name="role">
                        <option value="owner">Propietario</option>
                        <option value="manager">Gerente</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Solo lectura</option>
                      </select>
                      <button className="md-outlined-button px-3 text-xs" type="submit">
                        Guardar
                      </button>
                    </form>
                    {!member.isSelf ? (
                      <form action={removeTeamMemberAction}>
                        <input name="businessId" type="hidden" value={businessId} />
                        <input name="memberId" type="hidden" value={member.id} />
                        <button className="md-outlined-button px-4 text-xs" type="submit">
                          Remover
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : null}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="grid gap-2 text-sm font-black text-stone-800">
      {label}
      {children}
    </label>
  );
}
