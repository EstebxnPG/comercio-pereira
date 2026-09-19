import { PlaceholderShell } from "@/components/placeholder-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  return (
    <PlaceholderShell
      actions={[{ href: "/admin/negocios", label: "Negocios" }]}
      eyebrow="Admin"
      items={[
        "Categorias de negocio y futuras categorias de producto.",
        "Orden, visibilidad en home e iconografia.",
        "Validaciones para evitar romper URLs publicas.",
      ]}
      title="Categorias"
    />
  );
}
