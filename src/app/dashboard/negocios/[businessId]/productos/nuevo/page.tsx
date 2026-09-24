import Link from "next/link";
import { createProductAction } from "@/app/dashboard/negocios/[businessId]/productos/actions";
import { requireBusinessRole } from "@/lib/auth";

type NewProductPageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function NewProductPage(props: NewProductPageProps) {
  const { businessId } = await props.params;
  await requireBusinessRole(businessId, ["owner", "manager", "editor"]);

  return (
    <main className="min-h-screen bg-paper px-4 py-8 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-3xl gap-6">
        <header className="border-b border-stone-200 pb-6">
          <Link
            className="text-sm font-black text-brand hover:underline"
            href={`/dashboard/negocios/${businessId}/productos`}
          >
            Volver a productos
          </Link>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Nuevo producto</h1>
        </header>
        <ProductForm businessId={businessId} />
      </div>
    </main>
  );
}

function ProductForm({ businessId }: { businessId: string }) {
  return (
    <form action={createProductAction} className="md-surface grid gap-5 p-5">
      <input name="businessId" type="hidden" value={businessId} />
      <Field label="Nombre">
        <input className="md-field" maxLength={90} name="name" required />
      </Field>
      <Field label="Descripcion corta">
        <textarea
          className="md-field min-h-28 py-3"
          maxLength={240}
          name="shortDescription"
          required
        />
      </Field>
      <Field label="Descripcion completa">
        <textarea
          className="md-field min-h-36 py-3"
          maxLength={1200}
          name="description"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Precio">
          <input className="md-field" inputMode="numeric" name="price" placeholder="80000" />
        </Field>
        <Field label="Etiqueta de precio">
          <input className="md-field" maxLength={80} name="priceLabel" placeholder="Desde..." />
        </Field>
        <Field label="Disponibilidad">
          <select className="md-field" defaultValue="available" name="availability">
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
            Usa esto para mostrar badges como 10% OFF o 15% OFF en el catalogo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Porcentaje de descuento">
            <input
              className="md-field"
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
              maxLength={40}
              name="discountLabel"
              placeholder="15% OFF"
            />
          </Field>
          <Field label="Inicio">
            <input className="md-field" name="discountStartsAt" type="datetime-local" />
          </Field>
          <Field label="Fin">
            <input className="md-field" name="discountEndsAt" type="datetime-local" />
          </Field>
        </div>
      </section>
      <section className="grid gap-4 border-t border-stone-200 pt-4">
        <div>
          <h2 className="text-base font-black">Imagenes (opcional)</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-stone-600">
            Puedes agregar hasta 5 imagenes ahora mismo, o subirlas despues
            desde la pagina de edicion.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <Field label="Agregar imagenes">
            <input
              accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
              className="md-field h-auto min-h-14 py-3 file:mr-4 file:rounded-full file:border-0 file:bg-brand-soft file:px-4 file:py-2 file:text-sm file:font-black file:text-brand-deep"
              multiple
              name="images"
              type="file"
            />
          </Field>
          <Field label="Uso">
            <select className="md-field" defaultValue="primary" name="imageRole">
              <option value="primary">Usar como principal</option>
              <option value="gallery">Agregar a galeria</option>
            </select>
          </Field>
        </div>
      </section>
      <div className="flex flex-wrap justify-end gap-3 border-t border-stone-200 pt-4">
        <button className="md-outlined-button px-5" name="intent" type="submit" value="draft">
          Guardar borrador
        </button>
        <button className="md-filled-button px-5" name="intent" type="submit" value="submit">
          Enviar a revision
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
