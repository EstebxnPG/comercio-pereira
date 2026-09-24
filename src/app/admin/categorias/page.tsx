import Link from "next/link";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categorias/actions";
import { requireAdmin } from "@/lib/auth";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sort_order: number;
  show_on_home: boolean;
  businessCount: number;
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getAdminCategories();

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link className="text-sm font-black text-brand hover:underline" href="/admin/negocios">
            Volver a negocios
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Categorias</h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-stone-600">
            Gestiona las categorias de negocio que alimentan el selector al
            aprobar postulaciones. Esto todavia no controla lo que se ve en
            el home publico: esa vista sigue usando el catalogo fijo de
            categorias del codigo (<code>src/data/categories.ts</code>).
          </p>
        </header>

        <section className="md-surface grid gap-4 p-5">
          <h2 className="font-display text-xl font-bold">Nueva categoria</h2>
          <CategoryForm />
        </section>

        <section className="grid gap-3">
          {categories.length === 0 ? (
            <div className="md-surface p-6 text-sm font-semibold text-stone-600">
              Aun no hay categorias.
            </div>
          ) : (
            categories.map((category) => (
              <article className="md-surface grid gap-4 p-5" key={category.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-brand-deep">
                      {category.slug} · orden {category.sort_order} ·{" "}
                      {category.businessCount} negocio(s)
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold">
                      {category.icon} {category.name}
                    </h3>
                  </div>
                  {category.businessCount === 0 ? (
                    <form action={deleteCategoryAction}>
                      <input name="categoryId" type="hidden" value={category.id} />
                      <button className="md-outlined-button px-4 text-sm" type="submit">
                        Eliminar
                      </button>
                    </form>
                  ) : (
                    <span
                      className="rounded-full border border-dashed border-stone-300 px-3 py-1 text-xs font-black text-stone-400"
                      title="Tiene negocios asociados"
                    >
                      No se puede eliminar
                    </span>
                  )}
                </div>
                <CategoryForm category={category} />
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function CategoryForm({ category }: { category?: AdminCategory }) {
  return (
    <form
      action={category ? updateCategoryAction : createCategoryAction}
      className="grid gap-4 rounded-2xl border border-stone-200 bg-white p-4"
    >
      {category ? (
        <input name="categoryId" type="hidden" value={category.id} />
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Nombre">
          <input
            className="md-field"
            defaultValue={category?.name ?? ""}
            maxLength={80}
            name="name"
            required
          />
        </Field>
        <Field label="Slug">
          <input
            className="md-field"
            defaultValue={category?.slug ?? ""}
            maxLength={80}
            name="slug"
            placeholder="se genera del nombre si lo dejas vacio"
            required={Boolean(category)}
          />
        </Field>
        <Field label="Icono (emoji)">
          <input
            className="md-field"
            defaultValue={category?.icon ?? ""}
            maxLength={8}
            name="icon"
            placeholder="🛍️"
            required
          />
        </Field>
      </div>
      <Field label="Descripcion">
        <textarea
          className="md-field min-h-20 py-3"
          defaultValue={category?.description ?? ""}
          maxLength={200}
          name="description"
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <Field label="Orden">
          <input
            className="md-field"
            defaultValue={category?.sort_order ?? 0}
            inputMode="numeric"
            name="sortOrder"
            type="number"
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm font-black text-stone-800">
          <input
            defaultChecked={category?.show_on_home ?? false}
            name="showOnHome"
            type="checkbox"
          />
          Mostrar en home
        </label>
      </div>
      <div className="flex justify-end border-t border-stone-200 pt-4">
        <button className="md-filled-button px-5" type="submit">
          {category ? "Guardar cambios" : "Crear categoria"}
        </button>
      </div>
    </form>
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

async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = getSupabaseServiceRoleClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        icon,
        description,
        sort_order,
        show_on_home,
        businesses(count)
      `,
    )
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Admin categories query failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon,
    description: row.description,
    sort_order: row.sort_order,
    show_on_home: row.show_on_home,
    businessCount: getBusinessCount(row.businesses),
  }));
}

function getBusinessCount(value: unknown) {
  if (Array.isArray(value)) {
    return typeof value[0]?.count === "number" ? value[0].count : 0;
  }

  return typeof (value as { count?: unknown } | null)?.count === "number"
    ? (value as { count: number }).count
    : 0;
}
