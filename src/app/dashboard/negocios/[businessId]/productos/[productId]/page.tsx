import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteProductImageAction,
  setPrimaryProductImageAction,
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
          <section className="grid gap-4 border-t border-stone-200 pt-4">
            <div>
              <h2 className="text-base font-black">Descuento del producto</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-stone-600">
                Si el producto tiene precio numerico, se mostrara precio anterior,
                precio con descuento y badge publico.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Porcentaje de descuento">
                <input
                  className="md-field"
                  defaultValue={product.discount_percentage ?? ""}
                  inputMode="numeric"
                  max={90}
                  min={1}
                  name="discountPercentage"
                  placeholder="15"
                  type="number"
                />
              </Field>
              <Field label="Etiqueta visible">
                <input
                  className="md-field"
                  defaultValue={product.discount_label ?? ""}
                  maxLength={40}
                  name="discountLabel"
                  placeholder="15% OFF"
                />
              </Field>
              <Field label="Inicio">
                <input
                  className="md-field"
                  defaultValue={toDateTimeLocal(product.discount_starts_at)}
                  name="discountStartsAt"
                  type="datetime-local"
                />
              </Field>
              <Field label="Fin">
                <input
                  className="md-field"
                  defaultValue={toDateTimeLocal(product.discount_ends_at)}
                  name="discountEndsAt"
                  type="datetime-local"
                />
              </Field>
            </div>
          </section>
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

        <section className="md-surface grid gap-5 p-5">
          <div>
            <h2 className="text-xl font-black">Imagenes del producto</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-stone-600">
              Usa una imagen principal para catalogo y hasta 4 imagenes extra
              para la ficha del producto.
            </p>
          </div>

          {product.product_images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {product.product_images.map((image) => (
                <article
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                  key={image.id}
                >
                  <div className="relative grid aspect-[4/3] place-items-center bg-stone-100">
                    {image.is_primary ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[#B3262E] px-3 py-1 text-xs font-black text-white shadow-sm">
                        Principal
                      </span>
                    ) : null}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={image.alt_text ?? ""}
                      className="h-full w-full object-cover"
                      src={image.public_url}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 p-3">
                    {!image.is_primary ? (
                      <form action={setPrimaryProductImageAction}>
                        <input name="businessId" type="hidden" value={businessId} />
                        <input name="productId" type="hidden" value={product.id} />
                        <input name="imageId" type="hidden" value={image.id} />
                        <button className="md-outlined-button px-3 text-xs" type="submit">
                          Usar como principal
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteProductImageAction}>
                      <input name="businessId" type="hidden" value={businessId} />
                      <input name="productId" type="hidden" value={product.id} />
                      <input name="imageId" type="hidden" value={image.id} />
                      <button className="md-outlined-button px-3 text-xs" type="submit">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm font-semibold text-stone-600">
              Aun no hay imagenes para este producto.
            </div>
          )}

          <form
            action={uploadProductImageAction}
            className="grid gap-4 border-t border-stone-200 pt-4"
          >
            <input name="businessId" type="hidden" value={businessId} />
            <input name="productId" type="hidden" value={product.id} />
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <Field label="Agregar imagenes">
                <input
                  accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
                  className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-[#ffdad8] file:px-4 file:py-2 file:text-sm file:font-black file:text-[#410006]"
                  multiple
                  name="images"
                  required
                  type="file"
                />
              </Field>
              <Field label="Uso">
                <select className="md-field" name="imageRole">
                  <option value="gallery">Agregar a galeria</option>
                  <option value="primary">Usar como principal</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end">
              <button className="md-filled-button px-5" type="submit">
                Subir imagenes
              </button>
            </div>
          </form>
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
        discount_percentage,
        discount_label,
        discount_starts_at,
        discount_ends_at,
        status,
        moderation_status,
        availability,
        primary_image_url,
        product_images(
          id,
          public_url,
          alt_text,
          sort_order,
          is_primary
        )
      `,
    )
    .eq("id", productId)
    .eq("business_id", businessId)
    .single();

  if (error) {
    return null;
  }

  return {
    ...data,
    product_images: [...(data.product_images ?? [])].sort((first, second) => {
      if (first.is_primary !== second.is_primary) {
        return first.is_primary ? -1 : 1;
      }

      return first.sort_order - second.sort_order;
    }),
  };
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 16);
}
