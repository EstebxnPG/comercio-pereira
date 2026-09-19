import { PlaceholderShell } from "@/components/placeholder-shell";
import { requireAdmin } from "@/lib/auth";

export default async function AdminBusinessesPage() {
  await requireAdmin();

  return (
    <PlaceholderShell
      actions={[
        { href: "/admin/postulaciones", label: "Postulaciones" },
        { href: "/admin/productos", label: "Productos" },
      ]}
      eyebrow="Admin"
      items={[
        "Listado global de negocios con filtros por publicacion y verificacion.",
        "Acciones esperadas: ocultar, suspender, verificar y destacar.",
        "Vista de auditoria y miembros asociados.",
      ]}
      title="Negocios"
    />
  );
}
