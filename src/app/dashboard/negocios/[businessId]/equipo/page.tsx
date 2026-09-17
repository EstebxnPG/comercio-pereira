import { PlaceholderShell } from "@/components/placeholder-shell";
import { requireBusinessRole } from "@/lib/auth";

type TeamPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function BusinessTeamPage(props: TeamPageProps) {
  const { businessId } = await props.params;
  await requireBusinessRole(businessId, ["owner", "manager"]);

  return (
    <PlaceholderShell
      actions={[{ href: `/dashboard/negocios/${businessId}`, label: "Perfil" }]}
      eyebrow="CMS empresa"
      items={[
        "Miembros activos e invitados.",
        "Roles: owner, manager, editor y viewer.",
        "Invitar, cambiar rol y remover acceso.",
      ]}
      title="Equipo"
    />
  );
}
