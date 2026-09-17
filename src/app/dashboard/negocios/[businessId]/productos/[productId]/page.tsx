import Link from "next/link";
import { notFound } from "next/navigation";
import {
  updateProductAction,
  uploadProductImageAction,
} from "@/app/dashboard/negocios/[businessId]/productos/actions";
import { requireBusinessRole } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type EditProductPageProps = {
  params: Promise<{ businessId: string; productId: string }>;
  searchParams: Promise<{ saved?: string | string[] }>;
};

export default async function EditProductPage(props: EditProductPageProps) {
  const { businessId, productId } = await props.params;
  const searchParams = await props.searchParams;
  await requireBusinessRole(businessId, ["owner", "manager", "editor"]);
  const product = await getEditableProduct(businessId, productId);

  if (!product) {
    notFound();
  }

  const saved = getSingleParam(searchParams.saved) === "1";

  return (
    <main className="min-h-screen bg-[#fbfaf7] px-4 py-8 text-[#22211f] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-4xl gap-6">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              className="text-sm font-black text-[#B3262E] hover:underline"
              href={`/dashboard/negocios/${businessId}/productos`}
            >
              Volver a productos
            </Link>
            <h1 className="mt-3 text-3xl font-black">{product.name}</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Estado interno: {product.status}. Moderacion:{" "}
              {product.moderation_status}.
            </p>
          </div>
          {product.status === "published" ? (
            <Link className="md-outlined-button px-4" href={`/productos/${product.slug}`}>
              Ver publico
            </Link>
          ) : null}
        </header>

        {saved ? (
          <p className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-800">
            Cambios guardados.
          </p>
        ) : null}

        <form action={updateProductAction} className="md-surface grid gap-5 p-5">
          <input name="businessId" type="hidden" value={businessId} />
          <input name="productId" type="hidden" value={product.id} />
          <Field label="Nombre">
            <input
              className="md-field"
              defaultValue={product.name}
              maxLength={90}
              name="name"
              required
            />
          </Field>
          <Field label="Descripcion corta">
            <textarea
              className="md-field min-h-28 py-3"
              defaultValue={product.short_description}
              maxLength={240}
              name="shortDescription"
              required
            />
          </Field>
          <Field label="Descripcion completa">
            <textarea
              className="md-field min-h-36 py-3"
              defaultValue={product.description ?? ""}
              maxLength={1200}
              name="description"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Precio">
              <input
                className="md-field"
                defaultValue={
                  product.price_cents === null ? "" : String(product.price_cents / 100)
                }
                inputMode="numeric"
                name="price"
              />
            </Field>
            <Field label="Etiqueta de precio">
              <input
                className="md-field"
                defaultValue={product.price_label ?? ""}
                maxLength={80}
                name="priceLabel"
              />
            </Field>
            <Field label="Disponibilidad">
              <select
                className="md-field"
                defaultValue={product.availability}
                name="availability"
              >
                <option value="available">Disponible</option>
                <option value="on_request">Bajo pedido</option>
                <option value="out_of_stock">Agotado</option>
                <option value="discontinued">Descontinuado</option>
              </select>
            </Field>
          </div>
          <div className="flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-4">
            <button className="md-outlined-button px-5" name="intent" type="submit" value="draft">
              Guardar borrador
            </button>
            <button className="md-outlined-button px-5" name="intent" type="submit" value="hide">
              Ocultar
            </button>
            <button className="md-filled-button px-5" name="intent" type="submit" value="submit">
              Enviar a revision
            </button>
          </div>
        </form>

        <form action={uploadProductImageAction} className="md-surface grid gap-4 p-5">
          <input name="businessId" type="hidden" value={businessId} />
          <input name="productId" type="hidden" value={product.id} />
          <div>
            <h2 className="text-xl font-black">Imagen principal</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Esta imagen se usa en catalogo publico y ficha de producto.
            </p>
          </div>
          {product.primary_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt=""
              className="h-64 w-full rounded-xl border border-stone-200 object-contain"
              src={product.primary_image_url}
            />
          ) : null}
          <input
            accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
            className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffdad8] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#410006]"
            name="image"
            required
            type="file"
          />
          <button className="md-filled-button px-5" type="submit">
            Subir imagen
          </button>
        </form>
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

async function getEditableProduct(businessId: string, productId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        slug,
        name,
        short_description,
        description,
        price_cents,
        currency,
        price_label,
        status,
        moderation_status,
        availability,
        primary_image_url
      `,
    )
    .eq("id", productId)
    .eq("business_id", businessId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
